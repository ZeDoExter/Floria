# Flora Tailor - AWS Infrastructure

Terraform configuration สำหรับ deploy Flora Tailor e-commerce platform บน AWS

## Architecture

### AWS Services ที่ใช้:
- **ECS Fargate**: รัน microservices (Gateway, Product, Cart, Order, Search)
- **RDS PostgreSQL**: Database
- **Application Load Balancer**: Load balancing สำหรับ backend
- **ECR**: Docker image registry
- **S3 + CloudFront**: Host frontend (React)
- **VPC**: Network isolation
- **CodePipeline + CodeBuild**: CI/CD automation
- **Secrets Manager**: จัดการ secrets
- **CloudWatch**: Logs และ monitoring

## Prerequisites

1. **AWS CLI** - ติดตั้งและ configure
```bash
aws configure
```

2. **Terraform** - ติดตั้ง Terraform >= 1.0
```bash
# Windows (Chocolatey)
choco install terraform

# หรือ download จาก https://www.terraform.io/downloads
```

3. **GitHub Personal Access Token** - สร้าง token ที่มี repo permissions

4. **S3 Bucket สำหรับ Terraform State** (แนะนำ)
```bash
aws s3 mb s3://your-terraform-state-bucket --region ap-southeast-1
```

## Setup Instructions

### 1. Clone และเตรียม Configuration

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

แก้ไข `terraform.tfvars`:
```hcl
aws_region   = "ap-southeast-1"
project_name = "floratailor"
environment  = "prod"

db_username = "flora"
db_password = "YourStrongPassword123!"  # เปลี่ยนเป็น password ที่แข็งแรง

jwt_secret = "YourJWTSecret123!"  # เปลี่ยนเป็น secret ที่แข็งแรง

github_repo   = "your-username/flora-tailor"  # GitHub repo ของคุณ
github_branch = "main"
github_token  = "ghp_xxxxxxxxxxxxx"  # GitHub token ของคุณ
```

### 2. Initialize Terraform

```bash
# ถ้าใช้ S3 backend
terraform init -backend-config="bucket=your-terraform-state-bucket"

# หรือถ้าไม่ใช้ S3 backend (local state)
terraform init
```

### 3. Review Infrastructure Plan

```bash
terraform plan
```

ตรวจสอบ resources ที่จะถูกสร้าง:
- VPC, Subnets, NAT Gateway
- RDS PostgreSQL
- ECS Cluster + 5 Services
- ALB + Target Groups
- ECR Repositories (5 repos)
- S3 + CloudFront
- CodePipeline + CodeBuild

### 4. Deploy Infrastructure

```bash
terraform apply
```

พิมพ์ `yes` เพื่อยืนยัน

⏱️ **ใช้เวลาประมาณ 15-20 นาที**

### 5. Configure GitHub Connection

หลัง deploy เสร็จ:

1. ไปที่ AWS Console → Developer Tools → Connections
2. หา connection ชื่อ `floratailor-github`
3. คลิก "Update pending connection"
4. Authorize กับ GitHub account ของคุณ

### 6. Trigger First Deployment

```bash
# Push code ไป GitHub
git add .
git commit -m "Initial deployment"
git push origin main
```

CodePipeline จะ trigger automatically และ:
1. Build Docker images สำหรับทุก service
2. Push ไป ECR
3. Deploy ไป ECS
4. Build frontend และ upload ไป S3
5. Invalidate CloudFront cache

### 7. Get Deployment URLs

```bash
terraform output
```

Output:
```
alb_dns_name = "floratailor-alb-xxxxx.ap-southeast-1.elb.amazonaws.com"
cloudfront_domain = "dxxxxxxxxxxxxx.cloudfront.net"
```

- **Backend API**: `http://<alb_dns_name>`
- **Frontend**: `https://<cloudfront_domain>`

## Post-Deployment

### ตรวจสอบ Services

```bash
# ดู ECS services status
aws ecs list-services --cluster floratailor-cluster

# ดู logs
aws logs tail /ecs/floratailor/gateway --follow
```

### Run Database Migrations

```bash
# Connect ไป ECS task
aws ecs execute-command \
  --cluster floratailor-cluster \
  --task <task-id> \
  --container gateway \
  --interactive \
  --command "/bin/sh"

# หรือ run migration ผ่าน CodeBuild
```

### Monitor

- **CloudWatch Logs**: `/ecs/floratailor/*`
- **ECS Console**: ดู service health
- **CodePipeline**: ดู deployment status

## Cost Estimation

ค่าใช้จ่ายโดยประมาณต่อเดือน (ap-southeast-1):

- **ECS Fargate** (5 tasks, 0.25 vCPU, 0.5 GB): ~$30
- **RDS db.t3.micro**: ~$15
- **ALB**: ~$20
- **NAT Gateway**: ~$35
- **S3 + CloudFront**: ~$5
- **Data Transfer**: ~$10

**รวม: ~$115/เดือน**

### ลดค่าใช้จ่าย:
- ใช้ environment = "dev" (ลด desired_count)
- ปิด NAT Gateway ถ้าไม่จำเป็น
- ใช้ RDS Aurora Serverless
- ใช้ Spot instances

## Scaling

### Auto Scaling (เพิ่มเติม)

เพิ่ม auto scaling ใน `ecs.tf`:

```hcl
resource "aws_appautoscaling_target" "gateway" {
  max_capacity       = 4
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.gateway.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "gateway_cpu" {
  name               = "gateway-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.gateway.resource_id
  scalable_dimension = aws_appautoscaling_target.gateway.scalable_dimension
  service_namespace  = aws_appautoscaling_target.gateway.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 70.0
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}
```

## Cleanup

ลบทุกอย่าง:

```bash
terraform destroy
```

⚠️ **คำเตือน**: จะลบทุก resource รวมถึง database!

## Troubleshooting

### ECS Tasks ไม่ start

```bash
# ดู task logs
aws ecs describe-tasks --cluster floratailor-cluster --tasks <task-id>

# ตรวจสอบ CloudWatch logs
aws logs tail /ecs/floratailor/gateway --follow
```

### Database Connection Failed

- ตรวจสอบ Security Groups
- ตรวจสอบ Secrets Manager values
- ตรวจสอบ RDS endpoint

### CodePipeline Failed

- ตรวจสอบ CodeBuild logs
- ตรวจสอบ GitHub connection status
- ตรวจสอบ IAM permissions

## Next Steps

1. **Custom Domain**: เพิ่ม Route53 + ACM certificate
2. **HTTPS**: เพิ่ม SSL certificate ให้ ALB
3. **Monitoring**: ตั้ง CloudWatch Alarms
4. **Backup**: เพิ่ม automated backups
5. **WAF**: เพิ่ม AWS WAF สำหรับ security

## Support

หากมีปัญหา:
1. ตรวจสอบ CloudWatch Logs
2. ดู Terraform state: `terraform show`
3. ตรวจสอบ AWS Console
