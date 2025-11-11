output "alb_dns_name" {
  description = "ALB DNS name for backend API"
  value       = aws_lb.main.dns_name
}

output "cloudfront_domain" {
  description = "CloudFront domain for frontend"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "ecr_repositories" {
  description = "ECR repository URLs"
  value = {
    gateway         = aws_ecr_repository.gateway.repository_url
    product_service = aws_ecr_repository.product_service.repository_url
    cart_service    = aws_ecr_repository.cart_service.repository_url
    order_service   = aws_ecr_repository.order_service.repository_url
    search_service  = aws_ecr_repository.search_service.repository_url
  }
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "codepipeline_name" {
  description = "CodePipeline name"
  value       = aws_codepipeline.main.name
}
