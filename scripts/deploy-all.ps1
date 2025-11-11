# Deploy All Services Script
# Run this to deploy everything manually

$ErrorActionPreference = "Stop"

Write-Host "=== Flora Tailor Deployment Script ===" -ForegroundColor Green
Write-Host ""

# Variables
$AWS_REGION = "ap-southeast-1"
$AWS_ACCOUNT_ID = "225989373961"
$ECR_BASE = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
$S3_BUCKET = "floratailor-frontend-${AWS_ACCOUNT_ID}"
$CLOUDFRONT_ID = Read-Host "Enter CloudFront Distribution ID"

# Login to ECR
Write-Host "1. Logging in to ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_BASE

# Build and Push Backend Services
Write-Host ""
Write-Host "2. Building and pushing backend services..." -ForegroundColor Yellow

$services = @("gateway", "product-service", "cart-service", "order-service", "search-service")

foreach ($service in $services) {
    Write-Host "   - Building $service..." -ForegroundColor Cyan
    docker build -t "${ECR_BASE}/floratailor/${service}:latest" "./backend/${service}"
    
    Write-Host "   - Pushing $service..." -ForegroundColor Cyan
    docker push "${ECR_BASE}/floratailor/${service}:latest"
}

# Update ECS Services
Write-Host ""
Write-Host "3. Updating ECS services..." -ForegroundColor Yellow
aws ecs update-service --cluster floratailor-cluster --service floratailor-gateway --force-new-deployment
aws ecs update-service --cluster floratailor-cluster --service floratailor-product-service --force-new-deployment
aws ecs update-service --cluster floratailor-cluster --service floratailor-cart-service --force-new-deployment
aws ecs update-service --cluster floratailor-cluster --service floratailor-order-service --force-new-deployment
aws ecs update-service --cluster floratailor-cluster --service floratailor-search-service --force-new-deployment

# Build and Deploy Frontend
Write-Host ""
Write-Host "4. Building frontend..." -ForegroundColor Yellow
cd frontend
npm run build

Write-Host ""
Write-Host "5. Uploading to S3..." -ForegroundColor Yellow
aws s3 sync dist/ "s3://${S3_BUCKET}/" --delete

Write-Host ""
Write-Host "6. Invalidating CloudFront..." -ForegroundColor Yellow
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

cd ..

Write-Host ""
Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "Backend: http://floratailor-alb-1665932385.ap-southeast-1.elb.amazonaws.com"
Write-Host "Frontend: https://d2ynxnybvxfyco.cloudfront.net"
