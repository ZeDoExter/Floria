# ECR Repositories
resource "aws_ecr_repository" "gateway" {
  name                 = "${var.project_name}/gateway"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.project_name}-gateway"
    Environment = var.environment
  }
}

resource "aws_ecr_repository" "product_service" {
  name                 = "${var.project_name}/product-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.project_name}-product-service"
    Environment = var.environment
  }
}

resource "aws_ecr_repository" "cart_service" {
  name                 = "${var.project_name}/cart-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.project_name}-cart-service"
    Environment = var.environment
  }
}

resource "aws_ecr_repository" "order_service" {
  name                 = "${var.project_name}/order-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.project_name}-order-service"
    Environment = var.environment
  }
}

resource "aws_ecr_repository" "search_service" {
  name                 = "${var.project_name}/search-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.project_name}-search-service"
    Environment = var.environment
  }
}

# ECR Lifecycle Policies
resource "aws_ecr_lifecycle_policy" "main" {
  for_each = {
    gateway         = aws_ecr_repository.gateway.name
    product_service = aws_ecr_repository.product_service.name
    cart_service    = aws_ecr_repository.cart_service.name
    order_service   = aws_ecr_repository.order_service.name
    search_service  = aws_ecr_repository.search_service.name
  }

  repository = each.value

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus     = "any"
        countType     = "imageCountMoreThan"
        countNumber   = 10
      }
      action = {
        type = "expire"
      }
    }]
  })
}
