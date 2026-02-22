variable "project_name" {
  description = "The name of the project"
  type        = string
}

variable "environment" {
  description = "The deployment environment (e.g., prod, dev)"
  type        = string
}

variable "aws_region" {
  description = "AWS region for CloudWatch logs"
  type        = string
}

variable "db_username" {
  description = "Username for the RDS instance"
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC (for Service Discovery)"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for ECS services"
  type        = list(string)
}

variable "ecs_sg_id" {
  description = "Security Group ID for ECS tasks"
  type        = string
}

variable "gateway_repository_url" {
  description = "ECR repository URL for the gateway service"
  type        = string
}

variable "product_service_repository_url" {
  description = "ECR repository URL for the product service"
  type        = string
}

variable "cart_service_repository_url" {
  description = "ECR repository URL for the cart service"
  type        = string
}

variable "order_service_repository_url" {
  description = "ECR repository URL for the order service"
  type        = string
}

variable "search_service_repository_url" {
  description = "ECR repository URL for the search service"
  type        = string
}

variable "gateway_target_group_arn" {
  description = "ARN of the Gateway ALB target group"
  type        = string
}

variable "db_address" {
  description = "Address of the RDS instance"
  type        = string
}

variable "db_password_secret_arn" {
  description = "ARN of the Secrets Manager secret for DB password"
  type        = string
}

variable "jwt_secret_arn" {
  description = "ARN of the Secrets Manager secret for JWT secret"
  type        = string
}

variable "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution for CORS"
  type        = string
}
