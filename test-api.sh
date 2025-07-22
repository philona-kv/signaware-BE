#!/bin/bash

API_URL="https://ed94b47f64b4.ngrok-free.app"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "SignAware API Test Script"
echo "========================"

# Test Health Check
echo -e "\n${GREEN}Testing Health Check:${NC}"
curl -s "${API_URL}/api/v1/health" | json_pp

# Test Google Auth
echo -e "\n${GREEN}Testing Google Auth (you'll need to provide a Firebase ID token):${NC}"
read -p "Enter Firebase ID token: " FIREBASE_TOKEN

if [ ! -z "$FIREBASE_TOKEN" ]; then
    echo -e "\nSending authentication request..."
    RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/auth/google" \
        -H "Content-Type: application/json" \
        -d "{\"token\": \"${FIREBASE_TOKEN}\", \"role\": \"customer\"}")
    
    echo "Response:"
    echo $RESPONSE | json_pp
    
    # Extract JWT token from response
    JWT_TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    
    if [ ! -z "$JWT_TOKEN" ]; then
        # Test Protected Endpoint
        echo -e "\n${GREEN}Testing Protected Endpoint:${NC}"
        curl -s "${API_URL}/api/v1/protected" \
            -H "Authorization: Bearer ${JWT_TOKEN}" | json_pp
    fi
else
    echo -e "${RED}No token provided, skipping authentication tests${NC}"
fi 