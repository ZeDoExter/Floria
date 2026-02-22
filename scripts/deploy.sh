#!/bin/bash
set -e

# Change to script directory
cd "$(dirname "$0")"

echo -e "\033[1;32m=== Flora Tailor Smart Deployment Script ===\033[0m"

echo -e "\n\033[1;33m[1/6] Fetching outputs from Terraform...\033[0m"
cd ../terraform/environments/prod

S3_BUCKET=$(terraform output -raw frontend_bucket_name 2>/dev/null || echo "")
if [ -z "$S3_BUCKET" ] || [[ "$S3_BUCKET" == *"No outputs found"* ]]; then
    echo -e "\033[1;31mError: Terraform outputs not found. Please ensure you have run 'terraform apply' first!\033[0m"
    exit 1
fi

CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id)
ALB_DNS=$(terraform output -raw alb_dns_name)
CF_DOMAIN=$(terraform output -raw cloudfront_domain)
cd ../../../scripts

AWS_REGION="ap-southeast-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_BASE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo -e "\n\033[1;33m[2/6] Logging in to ECR...\033[0m"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_BASE

echo -e "\n\033[1;33m[3/6] Building and pushing backend services...\033[0m"
SERVICES=("gateway" "product-service" "cart-service" "order-service" "search-service")

for service in "${SERVICES[@]}"; do
    echo -e "  \033[1;36m-> Building $service...\033[0m"
    docker build -t "${ECR_BASE}/floratailor/${service}:latest" "../backend/${service}"
    
    echo -e "  \033[1;36m-> Pushing $service...\033[0m"
    docker push "${ECR_BASE}/floratailor/${service}:latest"
done

echo -e "\n\033[1;33m[4/6] Updating ECS services to deploy new images...\033[0m"
for service in "${SERVICES[@]}"; do
    aws ecs update-service --cluster floratailor-cluster --service "floratailor-${service}" --force-new-deployment > /dev/null
    echo -e "  \033[1;36m-> Triggered ECS rollout for floratailor-${service}\033[0m"
done

echo -e "\n\033[1;33m[5/6] Building frontend...\033[0m"
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build

echo -e "\n\033[1;33m[6/6] Uploading to S3 and Invalidating CloudFront...\033[0m"
aws s3 sync dist/ "s3://${S3_BUCKET}/" --delete
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

echo -e "\n\033[1;32m=== Deployment Complete ! ===\033[0m"
echo -e "Backend API : http://$ALB_DNS"
echo -e "Frontend URL: https://$CF_DOMAIN"
