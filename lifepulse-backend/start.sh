#!/bin/bash

# LifePulse Backend Startup Script

echo "Starting LifePulse Backend..."

# Check if environment variables are set
if [ -z "$MONGODB_URI" ]; then
    echo "Warning: MONGODB_URI environment variable is not set"
    echo "Using default: mongodb+srv://thrishith:saOx9o8s2BobRguH@cluster0.vf2b5qe.mongodb.net/lifepulse?retryWrites=true&w=majority&appName=Cluster0"
    export MONGODB_URI="mongodb+srv://thrishith:saOx9o8s2BobRguH@cluster0.vf2b5qe.mongodb.net/lifepulse?retryWrites=true&w=majority&appName=Cluster0"
fi

if [ -z "$JWT_SECRET" ]; then
    echo "Warning: JWT_SECRET environment variable is not set"
    echo "Using default: nHUEiDaqGVjAJLxdXF+iytwzo9DZUgXqdzyWErYVd4M="
    export JWT_SECRET="nHUEiDaqGVjAJLxdXF+iytwzo9DZUgXqdzyWErYVd4M="
fi

if [ -z "$CORS_ORIGINS" ]; then
    echo "Warning: CORS_ORIGINS environment variable is not set"
    echo "Using default: http://localhost:3000"
    export CORS_ORIGINS="http://localhost:3000"
fi

echo "Environment variables set:"
echo "MONGODB_URI: $MONGODB_URI"
echo "JWT_SECRET: [HIDDEN]"
echo "CORS_ORIGINS: $CORS_ORIGINS"

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "Error: Maven is not installed. Please install Maven to continue."
    exit 1
fi

# Check if Java 17+ is installed
if ! command -v java &> /dev/null; then
    echo "Error: Java is not installed. Please install Java 17+ to continue."
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
JAVA_MAJOR_VERSION=$(echo $JAVA_VERSION | cut -d. -f1)

if [ "$JAVA_MAJOR_VERSION" -lt 17 ]; then
    echo "Error: Java 17+ is required. Current version: $JAVA_VERSION"
    exit 1
fi

echo "Java version: $JAVA_VERSION ✓"

# Clean and build the project
echo "Building the project..."
mvn clean install -DskipTests

if [ $? -ne 0 ]; then
    echo "Error: Build failed. Please check the logs above."
    exit 1
fi

echo "Build successful ✓"

# Start the application
echo "Starting Spring Boot application..."
echo "The API will be available at: http://localhost:8080/api"
echo "Health check endpoint: http://localhost:8080/api/actuator/health"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

mvn spring-boot:run 