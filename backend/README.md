# MetroDocs Backend API

A comprehensive Express.js backend for the MetroDocs - Automated Task & Document Intelligence System.

## Features

- **JWT Authentication** with role-based access control
- **MySQL Database** with comprehensive schema
- **AI Microservice Integration** for document processing
- **Task Management** with assignment and tracking
- **Audit Logging** for all operations
- **Reporting System** with analytics and insights
- **RESTful API** with proper error handling

## Tech Stack

- Node.js + Express.js
- MySQL (mysql2)
- JWT for authentication
- bcrypt for password hashing
- AI Microservices integration

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=metro_docs_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# AI Microservices Configuration
AI_INTERNAL_TOKEN=your_ai_internal_token_here
AI_SUMMARIZATION_URL=http://localhost:8011/summarize
AI_TRANSLATION_URL=http://localhost:8012/translate
AI_ROLE_FILTER_URL=http://localhost:8013/assign

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE metro_docs_db;
```

2. The application will automatically create tables on startup.

### 4. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile

### Admin User Management (Admin Only)
- `POST /admin/users` - Create user
- `GET /admin/users` - List users
- `PATCH /admin/users/:id` - Update user
- `PATCH /admin/users/:id/password` - Reset password
- `DELETE /admin/users/:id` - Deactivate user

### Documents
- `GET /documents` - List documents
- `GET /documents/:id` - Get document details
- `POST /documents` - Upload document (Admin only)
- `POST /documents/:id/process` - Process document with AI (Admin only)

### Tasks
- `GET /tasks` - List tasks (filtered by user role)
- `POST /tasks/:id/progress` - Update task progress
- `POST /tasks/:id/escalate` - Escalate task
- `GET /tasks/:id/updates` - Get task updates

### Reports (Admin Only)
- `GET /reports/overview` - System overview
- `GET /reports/tasks` - Task reports
- `GET /reports/user-activity` - User activity logs

## User Roles

- **ADMIN**: Full system access
- **ENGINEER**: Task management and updates
- **SUB_DIV_OFFICER**: Task management and updates
- **DEPOT_MANAGER**: Task management and updates
- **OTHER**: Basic task access

## AI Microservices

The system integrates with three AI microservices:

1. **Summarization Service** (Port 8011)
   - Endpoint: `POST /summarize`
   - Input: `{ text: string }`
   - Output: `{ summary: string }`

2. **Translation Service** (Port 8012)
   - Endpoint: `POST /translate`
   - Input: `{ text: string, target_language: string }`
   - Output: `{ translated_text: string }`

3. **Role Filter Service** (Port 8013)
   - Endpoint: `POST /assign`
   - Input: `{ document_text: string, tasks: array }`
   - Output: `{ assignments: array }`

## Database Schema

### Core Tables
- `users` - User accounts and roles
- `documents` - Uploaded documents
- `summaries` - AI-generated summaries
- `tasks` - Generated tasks
- `task_assignments` - Task role assignments
- `task_updates` - Task progress updates
- `audit_logs` - System activity logs

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Rate limiting
- Input validation and sanitization
- Audit logging for all operations

## Error Handling

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Description",
  "data": {} // Optional
}
```

## Development

### Project Structure
```
backend/
├── index.js                 # Main server file
├── package.json
├── /routes                  # API route definitions
├── /controllers            # Business logic
├── /models                 # Database models
├── /middlewares            # Authentication & audit
└── /utils                  # Helper functions
```

### Adding New Features

1. Create controller in `/controllers`
2. Define routes in `/routes`
3. Add middleware for authentication/authorization
4. Update database schema if needed
5. Add audit logging

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure proper database credentials
4. Set up SSL/TLS
5. Configure reverse proxy (nginx)
6. Set up monitoring and logging

## License

MIT License - see LICENSE file for details.
