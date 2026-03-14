# Windows PowerShell Deployment Script
$ErrorActionPreference = "Stop"

Write-Host "=== Flora Tailor Smart Deployment Script ===" -ForegroundColor Green

Write-Host "`n[1/6] Fetching outputs from Terraform..." -ForegroundColor Yellow
$OriginalLocation = Get-Location
Push-Location "$PSScriptRoot/../terraform/environments/prod"

$S3_BUCKET = terraform output -raw frontend_bucket_name 2>$null
if ([string]::IsNullOrWhiteSpace($S3_BUCKET) -or $S3_BUCKET -match "No outputs found") {
    Write-Host "Error: Terraform outputs not found. Please ensure you have run 'terraform apply' first!" -ForegroundColor Red
    Pop-Location
    exit 1
}

$CLOUDFRONT_ID = terraform output -raw cloudfront_distribution_id
$ALB_DNS = terraform output -raw alb_dns_name
$CF_DOMAIN = terraform output -raw cloudfront_domain
Pop-Location

$AWS_REGION = "ap-southeast-1"
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
$ECR_BASE = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

Write-Host "`n[2/6] Logging in to ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_BASE

Write-Host "`n[3/6] Building and pushing backend services..." -ForegroundColor Yellow
$services = @("gateway", "inventory-service", "cart-service", "order-service", "payment-service")

foreach ($service in $services) {
    Write-Host "  -> Building $service..." -ForegroundColor Cyan
    docker build -t "${ECR_BASE}/floratailor/${service}:latest" "$PSScriptRoot/../backend/${service}"
    
    Write-Host "  -> Pushing $service..." -ForegroundColor Cyan
    docker push "${ECR_BASE}/floratailor/${service}:latest"
}

Write-Host "`n[4/6] Updating ECS services to deploy new images..." -ForegroundColor Yellow
foreach ($service in $services) {
    aws ecs update-service --cluster floratailor-cluster --service "floratailor-${service}" --force-new-deployment | Out-Null
    Write-Host "  -> Triggered ECS rollout for floratailor-${service}" -ForegroundColor Cyan
}

Write-Host "`n[5/6] Building frontend..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot/../frontend"
# ใช้วิธีเช็คก่อนว่ามี node_modules ไหม ถ้าไม่มีค่อย install
if (-not (Test-Path "node_modules")) {
    npm install
}
npm run build

Write-Host "`n[6/6] Uploading to S3 and Invalidating CloudFront..." -ForegroundColor Yellow
aws s3 sync dist/ "s3://${S3_BUCKET}/" --delete
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
Pop-Location

Write-Host "`n=== Deployment Complete ! ===" -ForegroundColor Green
Write-Host "Backend API : http://$ALB_DNS"
Write-Host "Frontend URL: https://$CF_DOMAIN"
