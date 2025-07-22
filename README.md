# SignAware Backend

AI-powered legal document analysis backend service built with NestJS and PostgreSQL.

## Features

- 🔐 **Authentication**: JWT-based auth with Google OAuth integration
- 📄 **Document Management**: Upload and analyze legal documents
- 🤖 **AI Analysis**: OpenAI-powered document analysis with risk assessment
- 💬 **Real-time Chat**: SSE streaming chat with documents
- 🛡️ **Security**: Data masking and privacy protection
- 📊 **Role-based Access**: Legal Advisor and Customer roles
- 📚 **API Documentation**: Swagger/OpenAPI documentation

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT + Google OAuth
- **AI**: OpenAI GPT-4
- **File Upload**: Multer
- **Real-time**: Server-Sent Events (SSE)
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- OpenAI API key
- Google OAuth credentials (optional)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd signaware-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```

4. **Configure environment variables**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=signaware

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # Google OAuth Configuration (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

   # OpenAI Configuration
   OPENAI_API_KEY=your-openai-api-key

   # Application Configuration
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3001

   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   ```

5. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb signaware

   # Run migrations (if using migrations)
   npm run migration:run
   ```

6. **Start the application**
   ```bash
   # Development
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/signin` - User login
- `POST /api/v1/auth/google` - Google OAuth authentication
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/verify-email` - Verify email address

### Documents
- `POST /api/v1/documents` - Create document
- `POST /api/v1/documents/upload` - Upload document file
- `GET /api/v1/documents` - Get user documents
- `GET /api/v1/documents/:id` - Get specific document
- `PATCH /api/v1/documents/:id` - Update document
- `DELETE /api/v1/documents/:id` - Delete document
- `POST /api/v1/documents/:id/analyze` - Analyze document
- `GET /api/v1/documents/:id/status` - Get analysis status
- `GET /api/v1/documents/:id/download` - Download document file

### Chat
- `POST /api/v1/chat/send` - Send chat message
- `POST /api/v1/chat/send/stream` - Send message with streaming response
- `GET /api/v1/chat/history/:documentId` - Get chat history
- `GET /api/v1/chat/sessions/:documentId` - Get chat sessions
- `POST /api/v1/chat/sessions/:documentId/:sessionId/delete` - Delete chat session
- `GET /api/v1/chat/stream/:documentId` - SSE stream for real-time updates

## User Roles

### Customer
- Upload and analyze legal documents
- Chat with documents
- View analysis results
- Manage personal documents

### Legal Advisor
- All customer features
- Access to advanced analysis tools
- Professional insights and recommendations

## Document Analysis Features

The AI analysis provides:
- **Summary**: Concise document overview
- **Risk Score**: 0-100 risk assessment
- **Key Concerns**: Important issues to watch
- **Loopholes**: Hidden or problematic clauses
- **Obligations**: User responsibilities
- **Recommendations**: Actionable advice

## Security Features

- **Data Masking**: Sensitive information is masked before processing
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permissions for different user types
- **File Validation**: Secure file upload with type and size validation
- **CORS Protection**: Configured CORS for frontend integration

## Development

### Available Scripts
```bash
npm run start:dev      # Start in development mode
npm run build          # Build the application
npm run start:prod     # Start in production mode
npm run test           # Run tests
npm run test:e2e       # Run end-to-end tests
npm run lint           # Run linter
npm run format         # Format code
```

### Database Migrations
```bash
npm run migration:generate -- src/migrations/MigrationName
npm run migration:run
npm run migration:revert
```

## File Upload Support

Supported file types:
- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Plain text (.txt)

Maximum file size: 10MB

## Real-time Features

- **Server-Sent Events (SSE)**: Real-time chat streaming
- **Typewriter Effect**: Character-by-character response display
- **Session Management**: Multiple chat sessions per document

## Error Handling

The application includes comprehensive error handling:
- Validation errors
- Authentication errors
- File processing errors
- AI analysis errors
- Database errors

## Monitoring and Logging

- Request/response logging
- Error tracking
- Performance monitoring
- Database query logging (development)

## Deployment

### Docker (Recommended)
```bash
# Build image
docker build -t signaware-backend .

# Run container
docker run -p 3000:3000 --env-file .env signaware-backend
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper CORS origins
- Set up SSL certificates
- Configure database connection pooling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

## Roadmap

- [ ] Email notifications
- [ ] Advanced document parsing
- [ ] Multi-language support
- [ ] Document templates
- [ ] Advanced analytics
- [ ] Mobile app support
- [ ] Integration with legal databases
- [ ] Blockchain document verification 