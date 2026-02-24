# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "${var.project_name}-cluster"
    Environment = var.environment
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "gateway" {
  name              = "/ecs/${var.project_name}/gateway"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "INVENTORY_service" {
  name              = "/ecs/${var.project_name}/INVENTORY-service"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "cart_service" {
  name              = "/ecs/${var.project_name}/cart-service"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "order_service" {
  name              = "/ecs/${var.project_name}/order-service"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "payment_service" {
  name              = "/ecs/${var.project_name}/payment-service"
  retention_in_days = 7
}

# ECS Task Execution Role
resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project_name}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_task_execution_secrets" {
  name = "${var.project_name}-ecs-secrets-policy"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "secretsmanager:GetSecretValue"
      ]
      Resource = [
        var.db_password_secret_arn,
        var.jwt_secret_arn
      ]
    }]
  })
}

# Task Definitions
resource "aws_ecs_task_definition" "gateway" {
  family                   = "${var.project_name}-gateway"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([{
    name  = "gateway"
    image = "${var.gateway_repository_url}:latest"

    portMappings = [{
      containerPort = 3000
      protocol      = "tcp"
    }]

    environment = [
      { name = "PORT", value = "3000" },
      { name = "NODE_ENV", value = "INVENTORYion" },
      { name = "POSTGRES_HOST", value = var.db_address },
      { name = "POSTGRES_PORT", value = "5432" },
      { name = "POSTGRES_USER", value = var.db_username },
      { name = "POSTGRES_DB", value = "floratailor" },
      { name = "INVENTORY_SERVICE_URL", value = "http://INVENTORY-service.local:3001" },
      { name = "CART_SERVICE_URL", value = "http://cart-service.local:3002" },
      { name = "ORDER_SERVICE_URL", value = "http://order-service.local:3003" },
      { name = "payment_SERVICE_URL", value = "http://payment-service.local:3005" },
      { name = "CORS_ORIGIN", value = "https://${var.cloudfront_domain_name}" }
    ]

    secrets = [
      { name = "POSTGRES_PASSWORD", valueFrom = var.db_password_secret_arn },
      { name = "JWT_SECRET", valueFrom = var.jwt_secret_arn }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.gateway.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_task_definition" "INVENTORY_service" {
  family                   = "${var.project_name}-INVENTORY-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([{
    name  = "INVENTORY-service"
    image = "${var.INVENTORY_service_repository_url}:latest"

    portMappings = [{
      containerPort = 3001
      protocol      = "tcp"
    }]

    environment = [
      { name = "PORT", value = "3001" },
      { name = "NODE_ENV", value = "INVENTORYion" },
      { name = "POSTGRES_HOST", value = var.db_address },
      { name = "POSTGRES_PORT", value = "5432" },
      { name = "POSTGRES_USER", value = var.db_username },
      { name = "POSTGRES_DB", value = "floratailor" }
    ]

    secrets = [
      { name = "POSTGRES_PASSWORD", valueFrom = var.db_password_secret_arn }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.INVENTORY_service.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_task_definition" "cart_service" {
  family                   = "${var.project_name}-cart-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([{
    name  = "cart-service"
    image = "${var.cart_service_repository_url}:latest"

    portMappings = [{
      containerPort = 3002
      protocol      = "tcp"
    }]

    environment = [
      { name = "PORT", value = "3002" },
      { name = "NODE_ENV", value = "INVENTORYion" },
      { name = "POSTGRES_HOST", value = var.db_address },
      { name = "POSTGRES_PORT", value = "5432" },
      { name = "POSTGRES_USER", value = var.db_username },
      { name = "POSTGRES_DB", value = "floratailor" }
    ]

    secrets = [
      { name = "POSTGRES_PASSWORD", valueFrom = var.db_password_secret_arn }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.cart_service.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_task_definition" "order_service" {
  family                   = "${var.project_name}-order-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([{
    name  = "order-service"
    image = "${var.order_service_repository_url}:latest"

    portMappings = [{
      containerPort = 3003
      protocol      = "tcp"
    }]

    environment = [
      { name = "PORT", value = "3003" },
      { name = "NODE_ENV", value = "INVENTORYion" },
      { name = "POSTGRES_HOST", value = var.db_address },
      { name = "POSTGRES_PORT", value = "5432" },
      { name = "POSTGRES_USER", value = var.db_username },
      { name = "POSTGRES_DB", value = "floratailor" }
    ]

    secrets = [
      { name = "POSTGRES_PASSWORD", valueFrom = var.db_password_secret_arn }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.order_service.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_task_definition" "payment_service" {
  family                   = "${var.project_name}-payment-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([{
    name  = "payment-service"
    image = "${var.payment_service_repository_url}:latest"

    portMappings = [{
      containerPort = 3005
      protocol      = "tcp"
    }]

    environment = [
      { name = "PORT", value = "3005" },
      { name = "NODE_ENV", value = "INVENTORYion" },
      { name = "POSTGRES_HOST", value = var.db_address },
      { name = "POSTGRES_PORT", value = "5432" },
      { name = "POSTGRES_USER", value = var.db_username },
      { name = "POSTGRES_DB", value = "floratailor" }
    ]

    secrets = [
      { name = "POSTGRES_PASSWORD", valueFrom = var.db_password_secret_arn }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.payment_service.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

# ECS Services
resource "aws_ecs_service" "gateway" {
  name            = "${var.project_name}-gateway"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.gateway.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_sg_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.gateway_target_group_arn
    container_name   = "gateway"
    container_port   = 3000
  }
}

resource "aws_ecs_service" "INVENTORY_service" {
  name            = "${var.project_name}-INVENTORY-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.INVENTORY_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_sg_id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.INVENTORY_service.arn
  }
}

resource "aws_ecs_service" "cart_service" {
  name            = "${var.project_name}-cart-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.cart_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_sg_id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.cart_service.arn
  }
}

resource "aws_ecs_service" "order_service" {
  name            = "${var.project_name}-order-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.order_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_sg_id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.order_service.arn
  }
}

resource "aws_ecs_service" "payment_service" {
  name            = "${var.project_name}-payment-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.payment_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_sg_id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.payment_service.arn
  }
}

# Service Discovery
resource "aws_service_discovery_private_dns_namespace" "main" {
  name = "local"
  vpc  = var.vpc_id
}

resource "aws_service_discovery_service" "INVENTORY_service" {
  name = "INVENTORY-service"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

resource "aws_service_discovery_service" "cart_service" {
  name = "cart-service"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

resource "aws_service_discovery_service" "order_service" {
  name = "order-service"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

resource "aws_service_discovery_service" "payment_service" {
  name = "payment-service"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}
