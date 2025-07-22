-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role_enum AS ENUM('legal_advisor', 'customer', 'admin');
CREATE TYPE document_status_enum AS ENUM('pending', 'processing', 'completed', 'failed');
CREATE TYPE document_type_enum AS ENUM('terms_of_service', 'privacy_policy', 'contract', 'agreement', 'other');
CREATE TYPE message_role_enum AS ENUM('user', 'assistant', 'system');

-- Create users table
CREATE TABLE users (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    email VARCHAR NOT NULL,
    password VARCHAR,
    "firstName" VARCHAR,
    "lastName" VARCHAR,
    role user_role_enum NOT NULL DEFAULT 'customer',
    "googleId" VARCHAR,
    avatar VARCHAR,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" VARCHAR,
    "passwordResetToken" VARCHAR,
    "passwordResetExpires" TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "UQ_users_email" UNIQUE (email),
    CONSTRAINT "PK_users" PRIMARY KEY (id)
);

-- Create documents table
CREATE TABLE documents (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    content TEXT NOT NULL,
    "originalFileName" VARCHAR,
    "filePath" VARCHAR,
    "fileSize" INTEGER,
    "mimeType" VARCHAR,
    type document_type_enum NOT NULL DEFAULT 'other',
    status document_status_enum NOT NULL DEFAULT 'pending',
    analysis JSONB,
    "maskedContent" JSONB,
    "processingStartedAt" TIMESTAMP,
    "processingCompletedAt" TIMESTAMP,
    "errorMessage" VARCHAR,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_documents" PRIMARY KEY (id)
);

-- Create chat_messages table
CREATE TABLE chat_messages (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    role message_role_enum NOT NULL DEFAULT 'user',
    "sessionId" VARCHAR,
    metadata JSONB,
    "userId" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_chat_messages" PRIMARY KEY (id)
);

-- Add foreign key constraints
ALTER TABLE documents ADD CONSTRAINT "FK_documents_userId" 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE chat_messages ADD CONSTRAINT "FK_chat_messages_userId" 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE chat_messages ADD CONSTRAINT "FK_chat_messages_documentId" 
    FOREIGN KEY ("documentId") REFERENCES documents(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX "IDX_users_email" ON users (email);
CREATE INDEX "IDX_users_role" ON users (role);
CREATE INDEX "IDX_documents_userId" ON documents ("userId");
CREATE INDEX "IDX_documents_status" ON documents (status);
CREATE INDEX "IDX_documents_type" ON documents (type);
CREATE INDEX "IDX_chat_messages_userId" ON chat_messages ("userId");
CREATE INDEX "IDX_chat_messages_documentId" ON chat_messages ("documentId");
CREATE INDEX "IDX_chat_messages_sessionId" ON chat_messages ("sessionId");

-- Insert a default admin user (optional)
INSERT INTO users (email, "firstName", "lastName", role, "isEmailVerified", "isActive")
VALUES ('admin@signaware.com', 'Admin', 'User', 'admin', true, true)
ON CONFLICT (email) DO NOTHING; 