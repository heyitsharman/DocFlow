# Office Management System - Backend

A comprehensive backend system for office document management with user authentication, file upload, and admin approval workflows.

## Features

### User Management
- **User Registration**: Sign up with employee ID, name, email, password, department, and position
- **Admin Registration**: Admins can create other admin accounts
- **Authentication**: JWT-based authentication with role-based access control
- **Profile Management**: Users can view and update their profiles

### Document Management
- **File Upload**: Support for various file types (PDF, Word documents, images, spreadsheets, presentations)
- **Document Metadata**: Title, description, category, priority, tags, expiry date
- **Status Workflow**: Documents start as 'pending' and can be approved/rejected by admins
- **File Categories**: Leave applications, expense reports, project documents, HR documents, etc.
- **Search & Filter**: Full-text search with filtering by category, status, department
- **Download Tracking**: Track download count and last download date

### Admin Panel
- **Dashboard**: Overview statistics and recent activity
- **Document Review**: Approve, reject, or mark documents under review
- **User Management**: View, activate/deactivate users
- **Reports**: Summary reports with date range and department filters
- **Bulk Operations**: Manage multiple documents efficiently

### Security Features
- **Password Hashing**: Bcrypt for secure password storage
- **JWT Authentication**: Stateless authentication with configurable expiration
- **File Validation**: MIME type validation and file size limits
- **Rate Limiting**: Prevent API abuse
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Comprehensive validation using express-validator

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Upload**: Multer
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Password Hashing**: Bcrypt

## Installation

1. **Clone the repository**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env` and update the values:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/office_management
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   ```

4. **Database Setup**
   - Install and start MongoDB
   - The application will create the database and collections automatically

5. **Create Upload Directory**
   ```bash
   mkdir uploads
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 5000).

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST /api/auth/signup
Register a new user
```json
{
  "employeeId": "EMP001",
  "name": "John Doe",
  "email": "john.doe@company.com",
  "password": "SecurePass123",
  "department": "IT",
  "position": "Developer",
  "phoneNumber": "+1234567890"
}
```

#### POST /api/auth/login
Login user
```json
{
  "employeeId": "EMP001",
  "password": "SecurePass123"
}
```

#### POST /api/auth/admin/signup
Create admin account (admin only)
- Requires admin authentication
- Same body as user signup

#### GET /api/auth/profile
Get current user profile (authenticated)

#### PUT /api/auth/profile
Update user profile (authenticated)

#### POST /api/auth/logout
Logout user (client-side token deletion)

### Document Routes (`/api/documents`)

#### POST /api/documents/upload
Upload a document
- **Content-Type**: multipart/form-data
- **File field**: `document`
- **Additional fields**: title, description, category, priority, tags, expiryDate

#### GET /api/documents
Get user's documents with pagination and filtering
- **Query params**: page, limit, status, category, sortBy, sortOrder

#### GET /api/documents/:id
Get single document details

#### PUT /api/documents/:id
Update document metadata (owner only, not approved/rejected docs)

#### DELETE /api/documents/:id
Delete document (owner only, not approved docs)

#### GET /api/documents/:id/download
Download document file

#### GET /api/documents/search/query
Search documents
- **Query params**: q (search query), category, status, page, limit

### Admin Routes (`/api/admin`)

#### GET /api/admin/dashboard
Admin dashboard with statistics

#### GET /api/admin/documents
Get all documents for review
- **Query params**: page, limit, status, category, department, sortBy, sortOrder

#### PUT /api/admin/documents/:id/review
Review document (approve/reject/under_review)
```json
{
  "status": "approved",
  "reviewComments": "Document approved"
}
```

#### GET /api/admin/users
Get all users with filtering
- **Query params**: page, limit, department, status, role, search

#### PUT /api/admin/users/:id/status
Activate/deactivate user
```json
{
  "isActive": true
}
```

#### GET /api/admin/reports/summary
Generate summary reports
- **Query params**: startDate, endDate, department

#### DELETE /api/admin/documents/:id
Delete any document (admin only)

## File Upload Specifications

### Supported File Types
- **Documents**: PDF, DOC, DOCX, TXT
- **Images**: JPEG, PNG, GIF, BMP, WEBP
- **Spreadsheets**: XLS, XLSX
- **Presentations**: PPT, PPTX

### File Size Limits
- Maximum file size: 10MB (configurable)
- Maximum files per upload: 5

### File Organization
- Files are stored in user-specific directories: `uploads/{employeeId}/`
- Unique filenames prevent conflicts
- Original filenames are preserved in database

## Document Categories
- `leave_application`: Leave requests and applications
- `expense_report`: Expense reports and reimbursements
- `project_document`: Project-related documents
- `personal_document`: Personal documents
- `compliance`: Compliance and regulatory documents
- `hr_document`: HR-related documents
- `finance_document`: Financial documents
- `other`: Other document types

## Document Status Workflow
1. **pending**: Initial status when uploaded
2. **under_review**: Admin has started reviewing
3. **approved**: Document approved by admin
4. **rejected**: Document rejected by admin

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

## Security Considerations

1. **Environment Variables**: Store sensitive data in `.env` file
2. **JWT Secret**: Use a strong, unique secret key
3. **File Validation**: Validate file types and sizes
4. **Rate Limiting**: Prevent API abuse
5. **Input Sanitization**: All inputs are validated and sanitized
6. **CORS**: Configure allowed origins for production

## Database Schema

### User Model
- Employee ID (unique identifier)
- Name, email, password (hashed)
- Department, position, phone number
- Role (user/admin), active status
- Timestamps and login tracking

### Document Model
- File information (name, path, size, type)
- Metadata (title, description, category, priority)
- Status workflow (pending → approved/rejected)
- User relationships (uploaded by, reviewed by)
- Search fields (tags, full-text search)
- Tracking (download count, dates)

## Performance Optimizations

1. **Database Indexing**: Optimized queries with proper indexes
2. **Pagination**: All list endpoints support pagination
3. **File Streaming**: Efficient file upload/download handling
4. **Aggregation Pipelines**: Optimized reports and statistics
5. **Selective Field Population**: Minimize data transfer

## Development Tips

1. **Testing**: Use tools like Postman or curl for API testing
2. **Database GUI**: Use MongoDB Compass for database management
3. **Logging**: Check console logs for debugging information
4. **File System**: Monitor upload directory for file management

## Production Deployment

1. **Environment**: Set `NODE_ENV=production`
2. **Database**: Use MongoDB Atlas or dedicated MongoDB server
3. **File Storage**: Consider cloud storage for files
4. **Reverse Proxy**: Use nginx for static file serving
5. **SSL/TLS**: Enable HTTPS for secure communication
6. **Monitoring**: Implement logging and monitoring solutions

## Contributing

1. Follow the existing code structure and naming conventions
2. Add proper validation for new endpoints
3. Include error handling for all operations
4. Update documentation for API changes
5. Test thoroughly before deployment