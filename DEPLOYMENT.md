# 🚀 คู่มือ Deploy Flora Tailor บน AWS (ฉบับละเอียด - พาทำทีละขั้นตอน)

## 📋 สารบัญ
1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [เตรียมความพร้อม](#เตรียมความพร้อม)
3. [ขั้นตอนที่ 1: ตั้งค่า AWS Account](#ขั้นตอนที่-1-ตั้งค่า-aws-account)
4. [ขั้นตอนที่ 2: ติดตั้ง Tools](#ขั้นตอนที่-2-ติดตั้ง-tools)
5. [ขั้นตอนที่ 3: เตรียม GitHub](#ขั้นตอนที่-3-เตรียม-github)
6. [ขั้นตอนที่ 4: สร้าง S3 Bucket](#ขั้นตอนที่-4-สร้าง-s3-bucket)
7. [ขั้นตอนที่ 5: Configure Terraform](#ขั้นตอนที่-5-configure-terraform)
8. [ขั้นตอนที่ 6: Deploy Infrastructure](#ขั้นตอนที่-6-deploy-infrastructure)
9. [ขั้นตอนที่ 7: Configure GitHub Connection](#ขั้นตอนที่-7-configure-github-connection)
10. [ขั้นตอนที่ 8: Build Docker Images](#ขั้นตอนที่-8-build-docker-images)
11. [ขั้นตอนที่ 9: Deploy Frontend](#ขั้นตอนที่-9-deploy-frontend)
12. [ขั้นตอนที่ 10: ทดสอบระบบ](#ขั้นตอนที่-10-ทดสอบระบบ)
13. [การ Update Code](#การ-update-code)
14. [Monitoring](#monitoring)
15. [Troubleshooting](#troubleshooting)
16. [ค่าใช้จ่าย](#คาใชจาย)
17. [การลบระบบ](#การลบระบบ)

---

## ภาพรวมระบบ

### AWS Services ที่ใช้
- **ECS Fargate**: รัน 5 microservices
- **RDS PostgreSQL**: Database
- **ALB**: Load Balancer
- **ECR**: Docker Registry
- **S3 + CloudFront**: Frontend
- **VPC**: Network
- **CodePipeline**: CI/CD
- **Secrets Manager**: Secrets
- **CloudWatch**: Logs

### Architecture
```
Internet → CloudFront (Frontend) ← S3
       → ALB → ECS Fargate → RDS
```

---

## เตรียมความพร้อม

### สิ่งที่ต้องมี
- ✅ AWS Account
- ✅ Credit Card
- ✅ GitHub Account
- ✅ Windows Computer
- ✅ เวลา 1-2 ชั่วโมง

### ค่าใช้จ่าย
- **ต่อเดือน**: ~$115 (~3,800 บาท)
- **ต่อวัน**: ~$4 (~130 บาท)

---

## ขั้นตอนที่ 1: ตั้งค่า AWS Account

### 1.1 สร้าง AWS Account

1. ไปที่ https://aws.amazon.com/
2. คลิก **Create an AWS Account**
3. กรอกข้อมูล Email, Password, Account name
4. เลือก Account type: **Personal**
5. กรอกข้อมูลส่วนตัวและ Credit Card
6. ยืนยันตัวตนผ่าน SMS
7. เลือก Support Plan: **Basic (Free)**

### 1.2 สร้าง IAM User

⚠️ **สำคัญ**: ไม่ควรใช้ Root Account

1. Login: https://console.aws.amazon.com/
2. ค้นหา **IAM** → คลิก
3. คลิก **Users** → **Create user**
4. User name: `floratailor-deployer`
5. คลิก **Next**
6. เลือก **Attach policies directly**
7. เลือก: ✅ `AdministratorAccess`
8. คลิก **Next** → **Create user**
9. คลิกที่ user → แท็บ **Security credentials**
10. คลิก **Create access key**
11. เลือก **Command Line Interface (CLI)**
12. ติ๊ก "I understand..."
13. คลิก **Next** → **Create access key**
14. **⚠️ Copy Access Key ID และ Secret Access Key**
15. คลิก **Download .csv file**
16. คลิก **Done**

💾 **เก็บ Keys ไว้ในที่ปลอดภัย**

---

## ขั้นตอนที่ 2: ติดตั้ง Tools

### 2.1 ติดตั้ง AWS CLI

1. Download: https://awscli.amazonaws.com/AWSCLIV2.msi
2. Double-click ไฟล์ → ติดตั้ง
3. เปิด Command Prompt
4. ตรวจสอบ:
```cmd
aws --version
```

5. Configure:
```cmd
aws configure
```
กรอก:
```
AWS Access Key ID: AKIAXXXXXXXXXXXXXXXX
AWS Secret Access Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Default region name: ap-southeast-1
Default output format: json
```

6. ทดสอบ:
```cmd
aws sts get-caller-identity
```

### 2.2 ติดตั้ง Terraform

**วิธีที่ 1: Chocolatey (แนะนำ)**

1. เปิด PowerShell แบบ **Run as Administrator**
2. ติดตั้ง Chocolatey:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

3. ติดตั้ง Terraform:
```powershell
choco install terraform
```

**วิธีที่ 2: Manual**

1. Download: https://www.terraform.io/downloads
2. แตกไฟล์ zip
3. ย้าย terraform.exe ไปที่ `C:\Windows\System32\`

**ตรวจสอบ**:
```cmd
terraform version
```

### 2.3 ติดตั้ง Git

1. Download: https://git-scm.com/download/win
2. ติดตั้งตามขั้นตอน
3. ตรวจสอบ:
```cmd
git --version
```

### 2.4 ติดตั้ง Docker Desktop

1. Download: https://www.docker.com/products/docker-desktop/
2. ติดตั้งและ restart
3. เปิด Docker Desktop
4. ตรวจสอบ:
```cmd
docker --version
```

---

## ขั้นตอนที่ 3: เตรียม GitHub

### 3.1 สร้าง Repository

1. Login: https://github.com/
2. คลิก **+** → **New repository**
3. Repository name: `flora-tailor`
4. เลือก **Private**
5. **ไม่ต้อง** ติ๊ก Initialize
6. คลิก **Create repository**

### 3.2 Push Code

เปิด Command Prompt ในโฟลเดอร์โปรเจกต์:

```cmd
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/flora-tailor.git
git push -u origin main
```

⚠️ เปลี่ยน `YOUR-USERNAME`

### 3.3 สร้าง Personal Access Token

1. GitHub → รูปโปรไฟล์ → **Settings**
2. **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token** → **Generate new token (classic)**
4. Note: `Flora Tailor Deployment`
5. Expiration: **90 days**
6. เลือก: ✅ **repo** (ทั้งหมด)
7. **Generate token**
8. **⚠️ Copy token** (ขึ้นต้นด้วย `ghp_`)

💾 **เก็บ Token ไว้**

---

## ขั้นตอนที่ 4: สร้าง S3 Bucket

### 4.1 Get Account ID

```cmd
aws sts get-caller-identity
```

Copy **Account ID** (เลข 12 หลัก)

### 4.2 สร้าง Bucket

```cmd
aws s3 mb s3://floratailor-terraform-state-YOUR-ACCOUNT-ID --region ap-southeast-1
```

⚠️ เปลี่ยน `YOUR-ACCOUNT-ID`

ตัวอย่าง:
```cmd
aws s3 mb s3://floratailor-terraform-state-123456789012 --region ap-southeast-1
```

### 4.3 Enable Versioning

```cmd
aws s3api put-bucket-versioning --bucket floratailor-terraform-state-YOUR-ACCOUNT-ID --versioning-configuration Status=Enabled
```

### 4.4 ตรวจสอบ

```cmd
aws s3 ls
```

---

## ขั้นตอนที่ 5: Configure Terraform

### 5.1 เตรียมไฟล์

```cmd
cd terraform
copy terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars
```

### 5.2 แก้ไข terraform.tfvars

```hcl
aws_region   = "ap-southeast-1"
project_name = "floratailor"
environment  = "prod"

db_username = "flora"
db_password = "MySecureP@ssw0rd2024!"  # ⚠️ เปลี่ยน!

jwt_secret = "super-secret-jwt-key-2024"  # ⚠️ เปลี่ยน!

github_repo   = "YOUR-USERNAME/flora-tailor"  # ⚠️ เปลี่ยน!
github_branch = "main"
github_token  = "ghp_xxxxxxxxxxxxx"  # ⚠️ ใส่ token!
```

**⚠️ สำคัญ**:
- `db_password`: ยาว 8+ ตัว มีตัวพิมพ์ใหญ่ เล็ก ตัวเลข อักขระพิเศษ
- `jwt_secret`: ยาว 32+ ตัว
- `github_repo`: รูปแบบ `username/repo-name`
- `github_token`: Token จากขั้นตอนที่ 3.3

### 5.3 บันทึก

กด **Ctrl+S** → ปิด Notepad

---

## ขั้นตอนที่ 6: Deploy Infrastructure

### 6.1 Initialize

```cmd
terraform init -backend-config="bucket=floratailor-terraform-state-YOUR-ACCOUNT-ID"
```

⚠️ เปลี่ยน `YOUR-ACCOUNT-ID`

**ควรเห็น**:
```
Terraform has been successfully initialized!
```

### 6.2 Validate

```cmd
terraform validate
```

**ควรเห็น**:
```
Success! The configuration is valid.
```

### 6.3 Plan

```cmd
terraform plan
```

**ใช้เวลา 1-2 นาที**

**ควรเห็น**:
```
Plan: 50+ to add, 0 to change, 0 to destroy.
```

### 6.4 Apply

⚠️ **ขั้นตอนนี้จะเริ่มเสียค่าใช้จ่าย**

```cmd
terraform apply
```

พิมพ์: `yes`

**⏱️ ใช้เวลา 15-20 นาที**

**เมื่อเสร็จ**:
```
Apply complete! Resources: 50+ added

Outputs:
alb_dns_name = "floratailor-alb-xxxxx.ap-southeast-1.elb.amazonaws.com"
cloudfront_domain = "dxxxxxxxxxxxxx.cloudfront.net"
ecr_repositories = {...}
```

💾 **Copy outputs ไว้**

### 6.5 ตรวจสอบ AWS Console

1. https://console.aws.amazon.com/
2. ตรวจสอบ:
   - **VPC**: `floratailor-vpc`
   - **EC2 → Load Balancers**: `floratailor-alb`
   - **ECS → Clusters**: `floratailor-cluster`
   - **RDS**: `floratailor-db`
   - **ECR**: 5 repositories
   - **S3**: 2 buckets
   - **CloudFront**: 1 distribution

---

## ขั้นตอนที่ 7: Configure GitHub Connection

### 7.1 ไปที่ AWS Console

1. https://console.aws.amazon.com/codesuite/settings/connections
2. หา connection: `floratailor-github`
3. Status: **Pending**

### 7.2 Update Connection

1. คลิก connection
2. คลิก **Update pending connection**
3. คลิก **Install a new app**
4. เลือก GitHub account
5. เลือก repository: `flora-tailor`
6. คลิก **Install**
7. คลิก **Connect**

### 7.3 ตรวจสอบ

Status ควรเป็น: **Available** ✅

---

## ขั้นตอนที่ 8: Build Docker Images

### 8.1 Get ECR Login

```cmd
cd ..
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin YOUR-ACCOUNT-ID.dkr.ecr.ap-southeast-1.amazonaws.com
```

⚠️ เปลี่ยน `YOUR-ACCOUNT-ID`

### 8.2 Get ECR URLs

```cmd
cd terraform
terraform output ecr_repositories
```

Copy URLs ทั้ง 5

### 8.3 Build และ Push (วิธีที่ 1: Manual)

```cmd
cd ..

REM Gateway
docker build -t YOUR-ACCOUNT-ID.dkr.ecr.ap-southeast-1.amazonaws.com/floratailor/gateway:latest ./backend/gateway
docker push YOUR-ACCOUNT-ID.dkr.ecr.ap-southeast-1.amazonaws.com/floratailor/gateway:latest


REM Product Service
docker build -t YOUR-ACCOUNT-ID.dkr.ecr.ap-southeast-1.amazonaws.com/floratailor/product-service:latest ./backend/product-service
docker push YOUR-ACCOUNT-ID.dkr.ecr.ap-southeast-1.amazonaws.com/floratailor/product-service:latest

REM Cart Service
docker build -t YOUR-ACCOUNT-ID.dkr.ecr.ap-southeast-1.amazonaws.com/floratailor/cart-service:latest ./backend/cart-service
docker push YOUR-ACCOUNT-ID.dkr.ecr.ap-southeast-1.amazonaws.com/floratailor/cart-service:latest

REM Order Service
docker build -t YOUR-ACCOUNT-ID.dkr.ecr.ap-southeast-1.amazonaws.com/floratailor/order-service:latest ./backend/order-service
docker push YOUR-ACCOUNT-ID.dkr.ecr.ap-southeast-1.amazonaws.com/floratailor/order-service:latest

REM Search Service
docker build -t YOUR-ACCOUNT-ID.dkr.ecr.ap-southeast-1.amazonaws.com/floratailor/search-service:latest ./backend/search-service
docker push YOUR-ACCOUNT-ID.dkr.ecr.ap-southeast-1.amazonaws.com/floratailor/search-service:latest
```

### 8.4 Build และ Push (วิธีที่ 2: Script)

```cmd
powershell -ExecutionPolicy Bypass -File .\scripts\push-initial-images.ps1
```

**⏱️ ใช้เวลา 10-15 นาที**

### 8.5 Update ECS Services

```cmd
aws ecs update-service --cluster floratailor-cluster --service floratailor-gateway --force-new-deployment --no-cli-pager
aws ecs update-service --cluster floratailor-cluster --service floratailor-product-service --force-new-deployment --no-cli-pager
aws ecs update-service --cluster floratailor-cluster --service floratailor-cart-service --force-new-deployment --no-cli-pager
aws ecs update-service --cluster floratailor-cluster --service floratailor-order-service --force-new-deployment --no-cli-pager
aws ecs update-service --cluster floratailor-cluster --service floratailor-search-service --force-new-deployment --no-cli-pager
```

### 8.6 ตรวจสอบ ECS

1. https://console.aws.amazon.com/ecs/
2. คลิก cluster: `floratailor-cluster`
3. ดู Services → ทั้ง 5 services ควร Running

**รอ 5-10 นาที** ให้ services start

---

## ขั้นตอนที่ 9: Deploy Frontend

### 9.1 Get ALB DNS

```cmd
cd terraform
terraform output alb_dns_name
```

Copy DNS name

### 9.2 สร้าง .env.production

```cmd
cd ..\frontend
notepad .env.production
```

เพิ่ม:
```
VITE_API_BASE_URL=http://YOUR-ALB-DNS-NAME
```

⚠️ เปลี่ยน `YOUR-ALB-DNS-NAME`

ตัวอย่าง:
```
VITE_API_BASE_URL=http://floratailor-alb-123456.ap-southeast-1.elb.amazonaws.com
```

บันทึก (Ctrl+S)

### 9.3 Build Frontend

```cmd
npm ci
npm run build
```

### 9.4 Get S3 Bucket Name

```cmd
cd ..\terraform
terraform output
```

หา S3 bucket name (ขึ้นต้นด้วย `floratailor-frontend-`)

### 9.5 Upload to S3

```cmd
cd ..\frontend
aws s3 sync dist/ s3://floratailor-frontend-YOUR-ACCOUNT-ID/ --delete
```

⚠️ เปลี่ยน bucket name

### 9.6 Get CloudFront ID

```cmd
cd ..\terraform
terraform output cloudfront_domain
```

หา Distribution ID:
```cmd
aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[0]==''].Id" --output text
```

หรือดูใน AWS Console → CloudFront

### 9.7 Invalidate CloudFront

```cmd
aws cloudfront create-invalidation --distribution-id YOUR-DISTRIBUTION-ID --paths "/*"
```

⚠️ เปลี่ยน `YOUR-DISTRIBUTION-ID`

---

## ขั้นตอนที่ 10: ทดสอบระบบ

### 10.1 Get URLs

```cmd
cd terraform
terraform output
```

- **Backend**: `alb_dns_name`
- **Frontend**: `cloudfront_domain`

### 10.2 ทดสอบ Backend

```cmd
curl http://YOUR-ALB-DNS/health
```

หรือเปิดใน browser

### 10.3 ทดสอบ Frontend

เปิด browser:
```
https://YOUR-CLOUDFRONT-DOMAIN
```
<!-- email
: 
"dfsafds@dfa.com"
firstName
: 
"fdsafd"
lastName
: 
"fdsafdsa"
password
: 
"fdsafdsa" -->
### 10.4 ทดสอบ Features

1. **Register**: สร้าง account ใหม่
2. **Login**: Login เข้าระบบ
3. **Browse Products**: ดูสินค้า
4. **Search**: ค้นหาสินค้า
5. **Add to Cart**: เพิ่มสินค้าในตะกร้า
6. **Checkout**: สั่งซื้อ
7. **View Orders**: ดูประวัติการสั่งซื้อ

### 10.5 ตรวจสอบ Logs

```cmd
aws logs tail /ecs/floratailor/gateway --follow
```

---

## ขั้นตอนที่ 11: ตั้งค่า GitHub Actions (Optional)

GitHub Actions จะ auto deploy ทุกครั้งที่ push code

### 11.1 เพิ่ม Secrets ใน GitHub

1. ไปที่ GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. คลิก **New repository secret**
3. เพิ่ม secrets ต่อไปนี้:

**Secrets ที่ต้องเพิ่ม:**

```
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_BASE_URL=http://floratailor-alb-1665932385.ap-southeast-1.elb.amazonaws.com
S3_BUCKET=floratailor-frontend-225989373961
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
```

**หา CloudFront Distribution ID:**
```cmd
aws cloudfront list-distributions --query "DistributionList.Items[?DomainName=='d2ynxnybvxfyco.cloudfront.net'].Id" --output text
```

### 11.2 ตรวจสอบไฟล์ Workflow

ไฟล์ `.github/workflows/deploy.yml` มีอยู่แล้ว

### 11.3 Commit และ Push

```cmd
git add .
git commit -m "Add GitHub Actions"
git push origin main
```

### 11.4 ตรวจสอบ

1. ไปที่ GitHub repo → แท็บ **Actions**
2. จะเห็น workflow "Deploy to AWS" กำลังรัน
3. คลิกเข้าไปดู logs

### 11.5 ทดสอบ Auto Deploy

แก้ไขโค้ด แล้ว push:

```cmd
git add .
git commit -m "Test auto deploy"
git push origin main
```

GitHub Actions จะ auto deploy ให้!

---

## การ Update Code

### วิธีที่ 1: ใช้ GitHub Actions (แนะนำ)

```cmd
git add .
git commit -m "Update feature"
git push origin main
```

GitHub Actions จะ deploy อัตโนมัติ

ดู progress: https://github.com/YOUR-USERNAME/flora-tailor/actions

### วิธีที่ 2: ใช้ CodePipeline

```cmd
git add .
git commit -m "Update feature"
git push origin main
```

Pipeline จะ deploy อัตโนมัติ

ดู progress:
https://console.aws.amazon.com/codesuite/codepipeline/pipelines

### วิธีที่ 2: Manual Deploy

**Backend**:
```cmd
REM Build image
docker build -t YOUR-ECR-URL/floratailor/gateway:latest ./backend/gateway
docker push YOUR-ECR-URL/floratailor/gateway:latest

REM Update service
aws ecs update-service --cluster floratailor-cluster --service floratailor-gateway --force-new-deployment
```

**Frontend**:
```cmd
cd frontend
npm run build
aws s3 sync dist/ s3://YOUR-BUCKET/ --delete
aws cloudfront create-invalidation --distribution-id YOUR-ID --paths "/*"
```

---

## Monitoring

### CloudWatch Logs

```cmd
REM Gateway
aws logs tail /ecs/floratailor/gateway --follow

REM Product Service
aws logs tail /ecs/floratailor/product-service --follow

REM Cart Service
aws logs tail /ecs/floratailor/cart-service --follow

REM Order Service
aws logs tail /ecs/floratailor/order-service --follow

REM Search Service
aws logs tail /ecs/floratailor/search-service --follow
```

### ECS Services

```cmd
REM List services
aws ecs list-services --cluster floratailor-cluster

REM Describe service
aws ecs describe-services --cluster floratailor-cluster --services floratailor-gateway
```

### RDS

```cmd
REM Get endpoint
cd terraform
terraform output rds_endpoint
```

---

## Troubleshooting

### ECS Tasks ไม่ start

**ตรวจสอบ**:
```cmd
aws ecs describe-tasks --cluster floratailor-cluster --tasks TASK-ID
```

**สาเหตุที่พบบ่อย**:
- Image ไม่มีใน ECR
- Secrets ผิด
- Security Group block
- Database connection failed

**แก้ไข**:
1. ตรวจสอบ CloudWatch Logs
2. ตรวจสอบ ECR images
3. ตรวจสอบ Secrets Manager
4. ตรวจสอบ Security Groups

### Database Connection Failed

**ตรวจสอบ**:
```cmd
REM RDS endpoint
terraform output rds_endpoint

REM Security groups
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

**แก้ไข**:
- ตรวจสอบ password ใน Secrets Manager
- ตรวจสอบ Security Group rules
- ตรวจสอบ VPC configuration

### Pipeline Failed

1. ไปที่ CodePipeline console
2. คลิก pipeline
3. ดู error details
4. ตรวจสอบ CodeBuild logs

### Frontend ไม่แสดง

**ตรวจสอบ**:
```cmd
REM S3 files
aws s3 ls s3://YOUR-BUCKET/

REM CloudFront
aws cloudfront get-distribution --id YOUR-ID
```

**แก้ไข**:
1. Re-upload to S3
2. Invalidate CloudFront
3. ตรวจสอบ CORS settings

---

## ค่าใช้จ่าย

### รายเดือน (~$115)

| Service | ค่าใช้จ่าย |
|---------|-----------|
| ECS Fargate (5 tasks) | $30 |
| RDS db.t3.micro | $15 |
| ALB | $20 |
| NAT Gateway | $35 |
| S3 + CloudFront | $5 |
| Data Transfer | $10 |

### ลดค่าใช้จ่าย

1. **ปิด NAT Gateway** (ถ้าไม่จำเป็น)
2. **ลด ECS tasks** (desired_count = 0 เมื่อไม่ใช้)
3. **ใช้ RDS Aurora Serverless**
4. **ใช้ Spot Instances**
5. **ตั้ง Auto Scaling** (scale down ตอนไม่ใช้)

---

## การลบระบบ

### ⚠️ คำเตือน
การลบจะลบทุกอย่างรวมถึง database!

### ขั้นตอน

1. **Empty S3 Buckets**:
```cmd
aws s3 rm s3://floratailor-frontend-YOUR-ACCOUNT-ID/ --recursive
aws s3 rm s3://floratailor-pipeline-artifacts-YOUR-ACCOUNT-ID/ --recursive
```

2. **Destroy Infrastructure**:
```cmd
cd terraform
terraform destroy
```

พิมพ์: `yes`

**⏱️ ใช้เวลา 10-15 นาที**

3. **ลบ S3 State Bucket** (ถ้าต้องการ):
```cmd
aws s3 rb s3://floratailor-terraform-state-YOUR-ACCOUNT-ID --force
```

4. **ตรวจสอบ AWS Console**:
- ตรวจสอบว่าไม่มี resources เหลืออยู่
- ตรวจสอบ billing

---

## 🎉 สรุป

คุณได้ deploy Flora Tailor บน AWS สำเร็จแล้ว!

### URLs
- **Frontend**: https://YOUR-CLOUDFRONT-DOMAIN
- **Backend**: http://YOUR-ALB-DNS

### Next Steps
1. ตั้งค่า Custom Domain (Route53)
2. เพิ่ม SSL Certificate (ACM)
3. ตั้ง CloudWatch Alarms
4. เพิ่ม WAF
5. ตั้ง Backup

### Support
หากมีปัญหา:
1. ตรวจสอบ CloudWatch Logs
2. ดู ECS task status
3. ตรวจสอบ Security Groups
4. ดู CodePipeline history

---

**Happy Deploying! 🚀**
