# MetroDocs Backend Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- AI Microservices running on ports 8011, 8012, 8013

## Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create a `.env` file with your configuration:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=metro_docs_db
JWT_SECRET=your_super_secret_jwt_key_here
AI_INTERNAL_TOKEN=your_ai_internal_token_here
AI_SUMMARIZATION_URL=http://localhost:8011/summarize
AI_TRANSLATION_URL=http://localhost:8012/translate
AI_ROLE_FILTER_URL=http://localhost:8013/assign
PORT=3000
NODE_ENV=development
```

### 3. Initialize Database
```bash
npm run init-db
```

This will:
- Create the database
- Create all required tables
- Create a default admin user (admin@metro-docs.com / admin123)

### 4. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Testing

### 1. Login as Admin
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@metro-docs.com","password":"admin123"}'
```

### 2. Create a User
```bash
curl -X POST http://localhost:3000/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name":"John Engineer",
    "email":"john@metro-docs.com",
    "password":"password123",
    "role":"ENGINEER"
  }'
```

### 3. Upload a Document
```bash
curl -X POST http://localhost:3000/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title":"Maintenance Report",
    "text":"The metro system requires regular maintenance checks. All engineers should inspect the tracks and electrical systems weekly."
  }'
```

### 4. Process Document
```bash
curl -X POST http://localhost:3000/documents/1/process \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Default Admin Credentials

- **Email**: admin@metro-docs.com
- **Password**: admin123
- **Role**: ADMIN

**⚠️ Important**: Change the admin password after first login!

## API Documentation

The API follows RESTful conventions with these main endpoints:

### Authentication
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/profile` - Get profile

### Admin (Admin only)
- `POST /admin/users` - Create user
- `GET /admin/users` - List users
- `PATCH /admin/users/:id` - Update user
- `PATCH /admin/users/:id/password` - Reset password
- `DELETE /admin/users/:id` - Deactivate user

### Documents
- `GET /documents` - List documents
- `GET /documents/:id` - Get document
- `POST /documents` - Upload document (Admin)
- `POST /documents/:id/process` - Process document (Admin)

### Tasks
- `GET /tasks` - List tasks
- `POST /tasks/:id/progress` - Update progress
- `POST /tasks/:id/escalate` - Escalate task
- `GET /tasks/:id/updates` - Get updates

### Reports (Admin only)
- `GET /reports/overview` - System overview
- `GET /reports/tasks` - Task reports
- `GET /reports/user-activity` - User activity

## Troubleshooting

### Database Connection Issues
1. Ensure MySQL is running
2. Check database credentials in `.env`
3. Verify database exists: `SHOW DATABASES;`

### AI Service Issues
1. Ensure AI microservices are running on ports 8011, 8012, 8013
2. Check `AI_INTERNAL_TOKEN` in `.env`
3. Test AI services directly:
   ```bash
   curl -X POST http://localhost:8011/summarize \
     -H "Content-Type: application/json" \
     -H "x-internal-token: YOUR_TOKEN" \
     -d '{"text":"Sample text to summarize"}'
   ```

### JWT Issues
1. Check `JWT_SECRET` in `.env`
2. Ensure token is included in Authorization header
3. Format: `Authorization: Bearer YOUR_JWT_TOKEN`

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong, unique JWT secrets
3. Configure proper database credentials
4. Set up SSL/TLS
5. Configure reverse proxy (nginx)
6. Set up monitoring and logging
7. Use PM2 for process management

## Support

For issues or questions, refer to the main README.md file or contact the development team.
