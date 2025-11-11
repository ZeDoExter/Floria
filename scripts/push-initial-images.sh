#!/bin/bash

# Script to push initial Docker images to ECR
# Run this after terraform apply

set -e

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="ap-southeast-1"
ECR_BASE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "AWS Account ID: ${AWS_ACCOUNT_ID}"
echo "ECR Base: ${ECR_BASE}"

# Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_BASE}

# Build and push Gateway
echo "Building and pushing Gateway..."
docker build -t ${ECR_BASE}/floratailor/gateway:latest ./backend/gateway
docker push ${ECR_BASE}/floratailor/gateway:latest

# Build and push Product Service
echo "Building and pushing Product Service..."
docker build -t ${ECR_BASE}/floratailor/product-service:latest ./backend/product-service
docker push ${ECR_BASE}/floratailor/product-service:latest

# Build and push Cart Service
echo "Building and pushing Cart Service..."
docker build -t ${ECR_BASE}/floratailor/cart-service:latest ./backend/cart-service
docker push ${ECR_BASE}/floratailor/cart-service:latest

# Build and push Order Service
echo "Building and pushing Order Service..."
docker build -t ${ECR_BASE}/floratailor/order-service:latest ./backend/order-service
docker push ${ECR_BASE}/floratailor/order-service:latest

# Build and push Search Service
echo "Building and pushing Search Service..."
docker build -t ${ECR_BASE}/floratailor/search-service:latest ./backend/search-service
docker push ${ECR_BASE}/floratailor/search-service:latest

echo "All images pushed successfully!"
echo ""
echo "Now you can update ECS services:"
echo "aws ecs update-service --cluster floratailor-cluster --service floratailor-gateway --force-new-deployment"
echo "aws ecs update-service --cluster floratailor-cluster --service floratailor-product-service --force-new-deployment"
echo "aws ecs update-service --cluster floratailor-cluster --service floratailor-cart-service --force-new-deployment"
echo "aws ecs update-service --cluster floratailor-cluster --service floratailor-order-service --force-new-deployment"
echo "aws ecs update-service --cluster floratailor-cluster --service floratailor-search-service --force-new-deployment"
