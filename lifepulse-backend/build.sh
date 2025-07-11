#!/bin/bash

echo "Cleaning previous build..."
mvn clean

echo "Removing target directory..."
rm -rf target/

echo "Compiling project..."
mvn compile -e -X

echo "Build completed!" 