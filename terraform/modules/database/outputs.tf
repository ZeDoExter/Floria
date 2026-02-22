output "db_address" {
  description = "The address of the RDS instance"
  value       = aws_db_instance.main.address
}

output "db_password_secret_arn" {
  description = "ARN of the Secrets Manager secret for DB password"
  value       = aws_secretsmanager_secret.db_password.arn
}

output "jwt_secret_arn" {
  description = "ARN of the Secrets Manager secret for JWT secret"
  value       = aws_secretsmanager_secret.jwt_secret.arn
}
