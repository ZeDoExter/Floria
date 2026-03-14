terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # ตั้งค่าตอน init: terraform init -backend-config="bucket=YOUR-BUCKET"
    key    = "floratailor/prod/terraform.tfstate"
    region = "ap-southeast-1"
  }
}

provider "aws" {
  region = var.aws_region
}

module "networking" {
  source       = "../../modules/networking"
  project_name = var.project_name
  environment  = var.environment
}

module "security" {
  source       = "../../modules/security"
  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.networking.vpc_id
}

module "database" {
  source             = "../../modules/database"
  project_name       = var.project_name
  environment        = var.environment
  db_username        = var.db_username
  db_password        = var.db_password
  jwt_secret         = var.jwt_secret
  private_subnet_ids = module.networking.private_subnet_ids
  rds_sg_id          = module.security.rds_sg_id
}

module "loadbalancer" {
  source            = "../../modules/loadbalancer"
  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.networking.vpc_id
  public_subnet_ids = module.networking.public_subnet_ids
  alb_sg_id         = module.security.alb_sg_id
}

module "ecr" {
  source       = "../../modules/ecr"
  project_name = var.project_name
  environment  = var.environment
}

module "frontend" {
  source       = "../../modules/frontend"
  project_name = var.project_name
  environment  = var.environment
}

module "compute" {
  source                         = "../../modules/compute"
  project_name                   = var.project_name
  environment                    = var.environment
  aws_region                     = var.aws_region
  db_username                    = var.db_username
  vpc_id                         = module.networking.vpc_id
  private_subnet_ids             = module.networking.private_subnet_ids
  ecs_sg_id                      = module.security.ecs_sg_id
  gateway_repository_url         = module.ecr.gateway_repository_url
  inventory_service_repository_url = module.ecr.inventory_service_repository_url
  cart_service_repository_url    = module.ecr.cart_service_repository_url
  order_service_repository_url   = module.ecr.order_service_repository_url
  payment_service_repository_url  = module.ecr.payment_service_repository_url
  gateway_target_group_arn       = module.loadbalancer.gateway_target_group_arn
  db_address                     = module.database.db_address
  db_password_secret_arn         = module.database.db_password_secret_arn
  jwt_secret_arn                 = module.database.jwt_secret_arn
  cloudfront_domain_name         = module.frontend.cloudfront_domain_name
}
