#!/bin/bash

# Default to development environment
ENV=${1:-development}

# Check if the environment is valid
if [ "$ENV" != "development" ] && [ "$ENV" != "staging" ] && [ "$ENV" != "production" ]; then
  echo "Invalid environment: $ENV"
  echo "Usage: ./docker-deploy.sh [development|staging|production]"
  exit 1
fi

echo "Deploying to $ENV environment..."

# Set environment variables
export NODE_ENV=$ENV

# Build and run the application with the appropriate configuration
if [ "$ENV" == "development" ]; then
  docker-compose up --build
elif [ "$ENV" == "staging" ]; then
  docker-compose -f docker-compose.yml -f docker-compose.staging.yml up --build -d
elif [ "$ENV" == "production" ]; then
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
fi

echo "Application deployed to $ENV environment" 