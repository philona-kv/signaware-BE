#!/bin/bash

echo "🚀 Setting up local SignAware database..."
echo ""

# Default connection settings
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="signaware"

echo "📋 Database connection info:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Step 1: Create database if it doesn't exist
echo "🔨 Step 1: Creating database '$DB_NAME'..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database may already exist (that's ok!)"
echo ""

# Step 2: Set up schema
echo "🏗️  Step 2: Setting up database schema..."
echo "Running database-setup.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database-setup.sql
echo ""

# Step 3: Load sample data
echo "📊 Step 3: Loading sample data..."
echo "Running sample-data.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f sample-data.sql
echo ""

# Step 4: Verify data
echo "✅ Step 4: Verifying data..."
echo "Checking table counts:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 
  'documents' as table_name, COUNT(*) as count FROM documents  
UNION ALL
SELECT 
  'chat_messages' as table_name, COUNT(*) as count FROM chat_messages;
"
echo ""

echo "🎉 Local database setup complete!"
echo ""
echo "💡 To connect your app to local database, update your .env:"
echo "  DB_HOST=localhost"
echo "  DB_PORT=5432"
echo "  DB_USERNAME=postgres"
echo "  DB_PASSWORD=your_postgres_password"
echo "  DB_DATABASE=signaware"
echo "  DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/signaware"
echo ""
echo "🚀 Now you can test with: npm run start:dev" 