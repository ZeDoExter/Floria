output "alb_dns_name" {
  description = "ALB DNS name for backend API"
  value       = module.loadbalancer.alb_dns_name
}

output "cloudfront_domain" {
  description = "CloudFront domain for frontend"
  value       = module.frontend.cloudfront_domain_name
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = module.frontend.cloudfront_distribution_id
}

output "frontend_bucket_name" {
  description = "Name of the S3 bucket for frontend"
  value       = module.frontend.frontend_bucket_name
}

output "ecr_repositories" {
  description = "ECR repository URLs"
  value = {
    gateway         = module.ecr.gateway_repository_url
    INVENTORY_service = module.ecr.INVENTORY_service_repository_url
    cart_service    = module.ecr.cart_service_repository_url
    order_service   = module.ecr.order_service_repository_url
    payment_service  = module.ecr.payment_service_repository_url
  }
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.database.db_address
  sensitive   = true
}
