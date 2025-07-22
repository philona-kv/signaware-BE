#!/bin/bash

# Dashboard API Test Script
# Usage: ./test-dashboard-api.sh [JWT_TOKEN]

BASE_URL="http://localhost:3000/api/v1"
JWT_TOKEN=${1:-"YOUR_JWT_TOKEN_HERE"}

echo "🚀 Testing Dashboard APIs..."
echo "Base URL: $BASE_URL"
echo "Token: ${JWT_TOKEN:0:20}..."
echo ""

# Test 1: Get complete dashboard data
echo "📊 Testing: GET /dashboard"
curl -X GET "$BASE_URL/dashboard" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.' 2>/dev/null || echo "Response received (install jq for pretty printing)"
echo -e "\n"

# Test 2: Get dashboard stats only
echo "📈 Testing: GET /dashboard/stats"
curl -X GET "$BASE_URL/dashboard/stats" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.' 2>/dev/null || echo "Response received"
echo -e "\n"

# Test 3: Get dashboard with custom limit
echo "📋 Testing: GET /dashboard?limit=10"
curl -X GET "$BASE_URL/dashboard?limit=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.' 2>/dev/null || echo "Response received"
echo -e "\n"

# Test 4: Get monthly analytics
echo "📅 Testing: GET /dashboard/analytics/monthly"
curl -X GET "$BASE_URL/dashboard/analytics/monthly?monthsBack=6" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.' 2>/dev/null || echo "Response received"
echo -e "\n"

# Test 5: Get global analytics (admin)
echo "🌍 Testing: GET /dashboard/analytics/global"
curl -X GET "$BASE_URL/dashboard/analytics/global" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.' 2>/dev/null || echo "Response received"
echo -e "\n"

echo "✅ Dashboard API tests completed!"
echo ""
echo "💡 Usage examples:"
echo "  - Main dashboard: GET /api/v1/dashboard"
echo "  - Stats only: GET /api/v1/dashboard/stats"
echo "  - Custom limit: GET /api/v1/dashboard?limit=10"
echo "  - Monthly data: GET /api/v1/dashboard/analytics/monthly?monthsBack=6"
echo "  - Global stats: GET /api/v1/dashboard/analytics/global" 