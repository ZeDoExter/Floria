output "gateway_repository_url" {
  description = "URL of the gateway ECR repository"
  value       = aws_ecr_repository.gateway.repository_url
}

output "product_service_repository_url" {
  description = "URL of the product service ECR repository"
  value       = aws_ecr_repository.product_service.repository_url
}

output "cart_service_repository_url" {
  description = "URL of the cart service ECR repository"
  value       = aws_ecr_repository.cart_service.repository_url
}

output "order_service_repository_url" {
  description = "URL of the order service ECR repository"
  value       = aws_ecr_repository.order_service.repository_url
}

output "search_service_repository_url" {
  description = "URL of the search service ECR repository"
  value       = aws_ecr_repository.search_service.repository_url
}
