# Office Management System API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create a `.env` file with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/office_management
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 3. Start MongoDB
Make sure MongoDB is running on your system.

### 4. Seed Database (Optional)
```bash
npm run seed
```

### 5. Start Server
```bash
npm run dev
```

## API Endpoints Summary

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/admin/signup` | Create admin (admin only) | Yes (Admin) |
| GET | `/auth/profile` | Get user profile | Yes |
| PUT | `/auth/profile` | Update profile | Yes |
| POST | `/auth/logout` | Logout user | Yes |

### Document Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/documents/upload` | Upload document | Yes |
| GET | `/documents` | Get user's documents | Yes |
| GET | `/documents/:id` | Get single document | Yes |
| PUT | `/documents/:id` | Update document | Yes (Owner) |
| DELETE | `/documents/:id` | Delete document | Yes (Owner) |
| GET | `/documents/:id/download` | Download file | Yes |
| GET | `/documents/search/query` | Search documents | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/dashboard` | Dashboard stats | Yes (Admin) |
| GET | `/admin/documents` | All documents | Yes (Admin) |
| PUT | `/admin/documents/:id/review` | Review document | Yes (Admin) |
| GET | `/admin/users` | All users | Yes (Admin) |
| PUT | `/admin/users/:id/status` | Update user status | Yes (Admin) |
| GET | `/admin/reports/summary` | Summary report | Yes (Admin) |
| DELETE | `/admin/documents/:id` | Delete any document | Yes (Admin) |

## Sample API Calls

### 1. User Registration
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP005",
    "name": "Test User",
    "email": "test@company.com",
    "password": "Test123!",
    "department": "IT",
    "position": "Developer"
  }'
```

### 2. User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP005",
    "password": "Test123!"
  }'
```

### 3. Upload Document
```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "document=@/path/to/your/file.pdf" \
  -F "title=My Document" \
  -F "description=Document description" \
  -F "category=project_document" \
  -F "priority=medium"
```

### 4. Get User Documents
```bash
curl -X GET "http://localhost:5000/api/documents?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Admin Review Document
```bash
curl -X PUT http://localhost:5000/api/admin/documents/DOCUMENT_ID/review \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "reviewComments": "Document looks good"
  }'
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## File Upload Guidelines

### Supported File Types
- Documents: PDF, DOC, DOCX, TXT
- Images: JPG, PNG, GIF, BMP, WEBP
- Spreadsheets: XLS, XLSX
- Presentations: PPT, PPTX

### File Size Limits
- Maximum size: 10MB per file
- Maximum files: 5 files per upload

### Document Categories
- `leave_application`: Leave requests
- `expense_report`: Expense reports
- `project_document`: Project files
- `personal_document`: Personal documents
- `compliance`: Compliance documents
- `hr_document`: HR documents
- `finance_document`: Financial documents
- `other`: Other types

### Document Status Flow
1. `pending` → Document uploaded, waiting for review
2. `under_review` → Admin is reviewing
3. `approved` → Document approved by admin
4. `rejected` → Document rejected by admin

## Testing with Postman

### Import Collection
1. Create a new Postman collection
2. Set base URL as `{{baseUrl}}` variable: `http://localhost:5000/api`
3. Create environment variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `userToken`: (set after login)
   - `adminToken`: (set after admin login)

### Authentication Flow
1. Register/Login to get JWT token
2. Set token in Authorization header for subsequent requests
3. Use `Bearer Token` type in Postman

### Sample Test Workflow
1. Register a new user
2. Login to get token
3. Upload a document
4. Login as admin (use seeded admin credentials)
5. Review and approve the document
6. Download the approved document

## Database Schema Overview

### Users Collection
```javascript
{
  _id: ObjectId,
  employeeId: String (unique),
  name: String,
  email: String (unique),
  password: String (hashed),
  department: String,
  position: String,
  role: String ('user' | 'admin'),
  isActive: Boolean,
  phoneNumber: String,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

### Documents Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  fileName: String,
  originalName: String,
  filePath: String,
  fileSize: Number,
  mimeType: String,
  fileType: String,
  category: String,
  status: String ('pending' | 'approved' | 'rejected' | 'under_review'),
  priority: String,
  uploadedBy: ObjectId (ref: User),
  reviewedBy: ObjectId (ref: User),
  reviewDate: Date,
  reviewComments: String,
  tags: [String],
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **File Upload Fails**
   - Check file size (max 10MB)
   - Verify file type is supported
   - Ensure uploads directory exists

3. **Authentication Errors**
   - Check JWT token validity
   - Verify token format: `Bearer <token>`
   - Check if user account is active

4. **Permission Denied**
   - Verify user role for admin endpoints
   - Check document ownership for user operations

### Development Tips

1. Use MongoDB Compass to inspect database
2. Check server logs for detailed error messages
3. Test with curl or Postman for API validation
4. Monitor uploads directory for file storage issues

## Production Considerations

1. **Security**
   - Use strong JWT secrets
   - Enable HTTPS
   - Implement rate limiting
   - Validate all inputs

2. **Performance**
   - Use database indexes
   - Implement caching
   - Optimize file storage
   - Monitor memory usage

3. **Scalability**
   - Use cloud storage for files
   - Implement database clustering
   - Use load balancers
   - Monitor and scale resources