output "gateway_repository_url" {
  description = "URL of the gateway ECR repository"
  value       = aws_ecr_repository.gateway.repository_url
}

output "INVENTORY_service_repository_url" {
  description = "URL of the INVENTORY service ECR repository"
  value       = aws_ecr_repository.INVENTORY_service.repository_url
}

output "cart_service_repository_url" {
  description = "URL of the cart service ECR repository"
  value       = aws_ecr_repository.cart_service.repository_url
}

output "order_service_repository_url" {
  description = "URL of the order service ECR repository"
  value       = aws_ecr_repository.order_service.repository_url
}

output "payment_service_repository_url" {
  description = "URL of the payment service ECR repository"
  value       = aws_ecr_repository.payment_service.repository_url
}
