-- Sample Data for Dashboard Testing
-- This script creates realistic test data for the dashboard

-- Insert sample users
INSERT INTO users (id, email, "firstName", "lastName", role, "isEmailVerified", "isActive", "createdAt", "updatedAt", "lastLoginAt") VALUES
('550e8400-e29b-41d4-a716-446655440000', 'john.doe@example.com', 'John', 'Doe', 'customer', true, true, '2024-01-10 10:00:00', '2024-01-15 14:30:00', '2024-01-15 14:30:00'),
('550e8400-e29b-41d4-a716-446655440001', 'jane.smith@example.com', 'Jane', 'Smith', 'legal_advisor', true, true, '2024-01-05 09:00:00', '2024-01-15 16:45:00', '2024-01-15 16:45:00'),
('550e8400-e29b-41d4-a716-446655440002', 'admin@signaware.com', 'Admin', 'User', 'admin', true, true, '2024-01-01 08:00:00', '2024-01-15 18:00:00', '2024-01-15 18:00:00'),
('550e8400-e29b-41d4-a716-446655440003', 'mike.johnson@example.com', 'Mike', 'Johnson', 'customer', true, true, '2024-01-12 11:30:00', '2024-01-15 12:15:00', '2024-01-15 12:15:00')
ON CONFLICT (email) DO NOTHING;

-- Insert sample documents with analysis data
INSERT INTO documents (id, title, content, "originalFileName", "filePath", "fileSize", "mimeType", type, status, analysis, "processingStartedAt", "processingCompletedAt", "userId", "createdAt", "updatedAt") VALUES

-- Document 1: Terms of Service - TechCorp (High Risk)
('660e8400-e29b-41d4-a716-446655440000', 'Terms of Service - TechCorp', 'Terms of Service for TechCorp platform. By using our service, you agree to these terms...', 'techcorp-tos.pdf', '/uploads/techcorp-tos.pdf', 245760, 'application/pdf', 'terms_of_service', 'completed', 
'{"summary": "Standard terms of service with some concerning clauses around data usage and liability.", "riskScore": 7.2, "keyConcerns": ["Broad data collection rights", "Limited liability protection", "Automatic renewal clauses"], "loopholes": ["Unclear termination process", "Vague data retention policy"], "obligations": ["User must maintain account security", "Regular review of terms required"], "recommendations": ["Negotiate data usage terms", "Clarify termination procedures", "Request liability limitations"], "processingTime": 45}',
'2024-01-15 10:00:00', '2024-01-15 10:00:45', '550e8400-e29b-41d4-a716-446655440000', '2024-01-15 09:30:00', '2024-01-15 10:00:45'),

-- Document 2: Employment Contract - StartupXYZ (Medium Risk)
('660e8400-e29b-41d4-a716-446655440001', 'Employment Contract - StartupXYZ', 'Employment agreement between StartupXYZ and employee...', 'startup-employment.docx', '/uploads/startup-employment.docx', 125440, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'contract', 'completed',
'{"summary": "Standard employment contract with competitive terms and clear responsibilities.", "riskScore": 4.8, "keyConcerns": ["Non-compete clause duration", "IP assignment scope"], "loopholes": ["Overtime compensation unclear"], "obligations": ["40-hour work week commitment", "Confidentiality requirements"], "recommendations": ["Review non-compete terms", "Clarify overtime policy"], "processingTime": 32}',
'2024-01-14 14:30:00', '2024-01-14 14:30:32', '550e8400-e29b-41d4-a716-446655440000', '2024-01-14 14:00:00', '2024-01-14 14:30:32'),

-- Document 3: Privacy Policy - EcommerceCorp (Low Risk)
('660e8400-e29b-41d4-a716-446655440002', 'Privacy Policy - EcommerceCorp', 'Privacy policy outlining data collection and usage practices...', 'ecommerce-privacy.pdf', '/uploads/ecommerce-privacy.pdf', 89600, 'application/pdf', 'privacy_policy', 'completed',
'{"summary": "Comprehensive privacy policy with clear data handling procedures and user rights.", "riskScore": 2.1, "keyConcerns": ["Third-party data sharing"], "loopholes": [], "obligations": ["Users can request data deletion", "Annual privacy policy review"], "recommendations": ["Policy looks good overall", "Minor clarifications on data retention"], "processingTime": 28}',
'2024-01-13 16:15:00', '2024-01-13 16:15:28', '550e8400-e29b-41d4-a716-446655440001', '2024-01-13 16:00:00', '2024-01-13 16:15:28'),

-- Document 4: Service Agreement - CloudProvider (High Risk)
('660e8400-e29b-41d4-a716-446655440003', 'Service Agreement - CloudProvider', 'Cloud hosting service agreement with uptime guarantees...', 'cloud-service.pdf', '/uploads/cloud-service.pdf', 156800, 'application/pdf', 'agreement', 'completed',
'{"summary": "Cloud service agreement with concerning liability limitations and data access clauses.", "riskScore": 8.5, "keyConcerns": ["Broad service interruption disclaimers", "Unlimited data access rights", "Weak security guarantees"], "loopholes": ["Unclear SLA enforcement", "Vague data breach notification"], "obligations": ["Monthly service fees", "Data backup responsibility"], "recommendations": ["Negotiate stronger SLAs", "Add data protection clauses", "Clarify breach procedures"], "processingTime": 52}',
'2024-01-12 11:45:00', '2024-01-12 11:45:52', '550e8400-e29b-41d4-a716-446655440003', '2024-01-12 11:30:00', '2024-01-12 11:45:52'),

-- Document 5: Freelance Agreement (Medium Risk)
('660e8400-e29b-41d4-a716-446655440004', 'Freelance Agreement - DesignStudio', 'Freelance design services agreement with project specifications...', 'freelance-design.docx', '/uploads/freelance-design.docx', 78340, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'contract', 'completed',
'{"summary": "Freelance agreement with reasonable terms but some payment and IP concerns.", "riskScore": 5.3, "keyConcerns": ["Payment schedule unclear", "IP ownership ambiguous"], "loopholes": ["Scope creep protection weak"], "obligations": ["Weekly progress reports", "Original work guarantee"], "recommendations": ["Clarify payment terms", "Define IP ownership clearly"], "processingTime": 35}',
'2024-01-11 09:20:00', '2024-01-11 09:20:35', '550e8400-e29b-41d4-a716-446655440000', '2024-01-11 09:00:00', '2024-01-11 09:20:35'),

-- More recent documents for "this month" stats
('660e8400-e29b-41d4-a716-446655440005', 'Software License Agreement', 'Enterprise software licensing terms and conditions...', 'software-license.pdf', '/uploads/software-license.pdf', 198760, 'application/pdf', 'agreement', 'completed',
'{"summary": "Enterprise software license with standard terms but expensive penalties.", "riskScore": 6.7, "keyConcerns": ["High penalty fees", "Audit rights extensive"], "loopholes": ["Termination notice period unclear"], "obligations": ["License compliance monitoring", "Regular usage reporting"], "recommendations": ["Negotiate penalty caps", "Clarify audit procedures"], "processingTime": 41}',
'2024-01-16 13:00:00', '2024-01-16 13:00:41', '550e8400-e29b-41d4-a716-446655440001', '2024-01-16 12:45:00', '2024-01-16 13:00:41'),

('660e8400-e29b-41d4-a716-446655440006', 'Vendor Agreement - SupplyCorp', 'Supply chain vendor agreement with delivery terms...', 'vendor-supply.pdf', '/uploads/vendor-supply.pdf', 134500, 'application/pdf', 'agreement', 'completed',
'{"summary": "Vendor agreement with reasonable terms and good protection clauses.", "riskScore": 3.4, "keyConcerns": ["Force majeure clause broad"], "loopholes": [], "obligations": ["Quality standards compliance", "Timely delivery requirements"], "recommendations": ["Agreement looks favorable", "Minor force majeure clarification"], "processingTime": 29}',
'2024-01-17 10:30:00', '2024-01-17 10:30:29', '550e8400-e29b-41d4-a716-446655440003', '2024-01-17 10:15:00', '2024-01-17 10:30:29');

-- Insert sample chat messages
INSERT INTO chat_messages (id, content, role, "sessionId", metadata, "userId", "documentId", "createdAt", "updatedAt") VALUES

-- Chat for TechCorp ToS
('770e8400-e29b-41d4-a716-446655440000', 'What are the main risks in this terms of service?', 'user', 'session-001', '{"tokens": 125}', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '2024-01-15 10:05:00', '2024-01-15 10:05:00'),
('770e8400-e29b-41d4-a716-446655440001', 'The main risks include broad data collection rights, limited liability protection, and automatic renewal clauses. I recommend reviewing the data usage terms and clarifying the termination procedures.', 'assistant', 'session-001', '{"tokens": 245, "processingTime": 2.3, "model": "gpt-4"}', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '2024-01-15 10:05:02', '2024-01-15 10:05:02'),

-- Chat for Employment Contract
('770e8400-e29b-41d4-a716-446655440002', 'Is the non-compete clause reasonable?', 'user', 'session-002', '{"tokens": 98}', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', '2024-01-14 15:00:00', '2024-01-14 15:00:00'),
('770e8400-e29b-41d4-a716-446655440003', 'The non-compete clause duration should be reviewed. Consider negotiating the scope and time period to ensure it aligns with industry standards and your career goals.', 'assistant', 'session-002', '{"tokens": 198, "processingTime": 1.8, "model": "gpt-4"}', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', '2024-01-14 15:00:02', '2024-01-14 15:00:02'),

-- Chat for Privacy Policy
('770e8400-e29b-41d4-a716-446655440004', 'How does this privacy policy compare to GDPR requirements?', 'user', 'session-003', '{"tokens": 87}', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '2024-01-13 16:30:00', '2024-01-13 16:30:00'),
('770e8400-e29b-41d4-a716-446655440005', 'This privacy policy appears to be GDPR compliant with clear data handling procedures and user rights. The policy includes proper consent mechanisms and data deletion rights.', 'assistant', 'session-003', '{"tokens": 187, "processingTime": 2.1, "model": "gpt-4"}', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '2024-01-13 16:30:02', '2024-01-13 16:30:02');

-- Update user last login times to recent dates
UPDATE users SET "lastLoginAt" = NOW() - INTERVAL '2 hours' WHERE email = 'john.doe@example.com';
UPDATE users SET "lastLoginAt" = NOW() - INTERVAL '1 hour' WHERE email = 'jane.smith@example.com';
UPDATE users SET "lastLoginAt" = NOW() - INTERVAL '30 minutes' WHERE email = 'admin@signaware.com';
UPDATE users SET "lastLoginAt" = NOW() - INTERVAL '4 hours' WHERE email = 'mike.johnson@example.com';

-- Summary of inserted data:
-- ✅ 4 users (different roles)
-- ✅ 7 documents (various risk scores: 2.1, 3.4, 4.8, 5.3, 6.7, 7.2, 8.5)
-- ✅ 6 chat messages (realistic conversations)
-- ✅ Recent completion dates for "this month" calculations
-- ✅ Realistic processing times and file metadata

SELECT 'Sample data inserted successfully!' as result; 