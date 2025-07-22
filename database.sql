-- Create enum types
CREATE TYPE user_role_enum AS ENUM ('legal_advisor', 'customer', 'admin');
CREATE TYPE document_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE document_type_enum AS ENUM ('terms_of_service', 'privacy_policy', 'contract', 'agreement', 'other');
CREATE TYPE message_role_enum AS ENUM ('user', 'assistant', 'system');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    role user_role_enum DEFAULT 'customer',
    google_id VARCHAR,
    avatar VARCHAR,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR,
    password_reset_token VARCHAR,
    password_reset_expires TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    content TEXT NOT NULL,
    original_file_name VARCHAR,
    file_path VARCHAR,
    file_size INTEGER,
    mime_type VARCHAR,
    type document_type_enum DEFAULT 'other',
    status document_status_enum DEFAULT 'pending',
    analysis JSONB,
    masked_content TEXT,
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    error_message VARCHAR,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create chat_messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    role message_role_enum DEFAULT 'user',
    session_id VARCHAR,
    metadata JSONB,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_chat_messages_document_id ON chat_messages(document_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id); 