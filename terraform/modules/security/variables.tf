variable "project_name" {
  description = "The name of the project"
  type        = string
}

variable "environment" {
  description = "The deployment environment (e.g., prod, dev)"
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC created by the networking module"
  type        = string
}
