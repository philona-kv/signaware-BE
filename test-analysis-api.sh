#!/bin/bash

# Test script for Text Analysis API endpoints
# Make sure your NestJS server is running on http://localhost:3000

BASE_URL="http://localhost:3000"
AUTH_TOKEN="" # Add your JWT token here

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Testing Text Analysis API Endpoints${NC}"
echo "========================================="

# Check if JWT token is provided
if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${RED}❌ Please set AUTH_TOKEN variable with your JWT token${NC}"
    echo "Example: AUTH_TOKEN=\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\""
    exit 1
fi

# Sample text for testing
SAMPLE_TEXT="This software license agreement contains several important clauses. The user must comply with all terms and conditions. Any violation of this agreement may result in termination of service and legal action. The company retains exclusive rights to the software and may collect personal data for analytics purposes. Users are responsible for maintaining account security and must not share login credentials."

echo -e "\n${BLUE}📄 Sample Text:${NC}"
echo "\"$SAMPLE_TEXT\""
echo ""

# Test 1: Comprehensive Text Analysis
echo -e "${GREEN}1. Testing Comprehensive Text Analysis${NC}"
echo "POST $BASE_URL/analysis/analyze-text"
echo ""

curl -X POST "$BASE_URL/analysis/analyze-text" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"content\": \"$SAMPLE_TEXT\",
    \"analysisType\": \"legal\"
  }" \
  | jq '.' || echo -e "${RED}❌ Failed to analyze text${NC}"

echo -e "\n${GREEN}================================${NC}\n"

# Test 2: Generate Summary
echo -e "${GREEN}2. Testing Text Summarization${NC}"
echo "POST $BASE_URL/analysis/summarize"
echo ""

curl -X POST "$BASE_URL/analysis/summarize" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"content\": \"$SAMPLE_TEXT\"
  }" \
  | jq '.' || echo -e "${RED}❌ Failed to generate summary${NC}"

echo -e "\n${GREEN}================================${NC}\n"

# Test 3: Extract Key Terms
echo -e "${GREEN}3. Testing Key Terms Extraction${NC}"
echo "POST $BASE_URL/analysis/extract-key-terms"
echo ""

curl -X POST "$BASE_URL/analysis/extract-key-terms" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"content\": \"$SAMPLE_TEXT\"
  }" \
  | jq '.' || echo -e "${RED}❌ Failed to extract key terms${NC}"

echo -e "\n${GREEN}================================${NC}\n"

# Test 4: Error handling (empty content)
echo -e "${GREEN}4. Testing Error Handling (Invalid Input)${NC}"
echo "POST $BASE_URL/analysis/analyze-text (with invalid short text)"
echo ""

curl -X POST "$BASE_URL/analysis/analyze-text" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"content\": \"Short\"
  }" \
  | jq '.' || echo -e "${RED}❌ Validation test failed${NC}"

echo -e "\n${BLUE}✅ Testing Complete!${NC}"
echo ""
echo -e "${BLUE}📖 API Documentation:${NC}"
echo "Visit http://localhost:3000/api-docs to see the Swagger documentation"
echo ""
echo -e "${BLUE}🔗 API Endpoints:${NC}"
echo "• POST /analysis/analyze-text     - Comprehensive analysis"
echo "• POST /analysis/summarize        - Generate summary"  
echo "• POST /analysis/extract-key-terms - Extract key terms" 