# Office Management System Backend - Complete Setup

## 🎉 What Has Been Created

I've built a complete, production-ready backend for your office management system with all the features you requested:

### ✅ Core Features Implemented

#### 1. **User & Admin Authentication**
- ✅ User signup with employee ID, name, email, password, department, position
- ✅ Admin signup (only admins can create other admins)
- ✅ Secure login with JWT authentication
- ✅ Role-based access control (user/admin)
- ✅ Password hashing with bcrypt
- ✅ Profile management

#### 2. **Document Management System**
- ✅ File upload for multiple formats (PDF, Word, Images, Excel, PowerPoint)
- ✅ Document metadata (title, description, category, priority, tags)
- ✅ Status workflow: pending → under_review → approved/rejected
- ✅ File size validation (10MB limit)
- ✅ Secure file storage with user-specific directories
- ✅ Download tracking and file access control

#### 3. **Admin Panel Functionality**
- ✅ Dashboard with statistics and overview
- ✅ Document review system (approve/reject/under review)
- ✅ User management (view, activate/deactivate users)
- ✅ Comprehensive filtering and search
- ✅ Reports and analytics
- ✅ Bulk operations support

#### 4. **Advanced Features**
- ✅ Full-text search across documents
- ✅ Pagination for all list endpoints
- ✅ File type detection and validation
- ✅ Comprehensive error handling
- ✅ Input validation and sanitization
- ✅ Rate limiting for security
- ✅ CORS configuration
- ✅ Database indexing for performance

## 📁 Project Structure

```
Backend/
├── models/
│   ├── User.js          # User model with authentication
│   └── Document.js      # Document model with workflow
├── routes/
│   ├── auth.js          # Authentication endpoints
│   ├── documents.js     # Document management endpoints
│   └── admin.js         # Admin panel endpoints
├── middleware/
│   ├── auth.js          # JWT authentication middleware
│   └── upload.js        # File upload middleware
├── scripts/
│   └── seed.js          # Database seeding script
├── uploads/             # File storage directory
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
├── .env                 # Environment variables
├── README.md            # Comprehensive documentation
├── API_DOCS.md          # API documentation
└── .gitignore           # Git ignore rules
```

## 🚀 Quick Start Guide

### 1. **Install MongoDB**
Make sure MongoDB is installed and running on your system.

### 2. **Environment Setup**
The `.env` file is already configured with default values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/office_management
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 3. **Start the Server**
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

### 4. **Seed Sample Data (Optional)**
```bash
npm run seed
```

This creates:
- **Admin**: Employee ID: `ADMIN001`, Password: `Admin123!`
- **Sample Users**: EMP001-EMP004, Password: `User123!`

## 📋 Default Login Credentials

After running `npm run seed`:

### Admin Account
- **Employee ID**: `ADMIN001`
- **Password**: `Admin123!`
- **Email**: `admin@company.com`

### Sample User Account
- **Employee ID**: `EMP001`
- **Password**: `User123!`
- **Email**: `john.doe@company.com`

## 🔌 API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - User login
- `POST /admin/signup` - Create admin (admin only)
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile

### Documents (`/api/documents`)
- `POST /upload` - Upload document
- `GET /` - Get user's documents
- `GET /:id` - Get single document
- `PUT /:id` - Update document
- `DELETE /:id` - Delete document
- `GET /:id/download` - Download file
- `GET /search/query` - Search documents

### Admin Panel (`/api/admin`)
- `GET /dashboard` - Dashboard statistics
- `GET /documents` - All documents for review
- `PUT /documents/:id/review` - Approve/reject documents
- `GET /users` - Manage users
- `PUT /users/:id/status` - Activate/deactivate users
- `GET /reports/summary` - Generate reports

## 🎯 Document Workflow

1. **User uploads document** → Status: `pending`
2. **Admin reviews** → Status: `under_review`
3. **Admin decision** → Status: `approved` or `rejected`
4. **User can download approved documents**

## 📝 Supported File Types

- **Documents**: PDF, DOC, DOCX, TXT
- **Images**: JPEG, PNG, GIF, BMP, WEBP
- **Spreadsheets**: XLS, XLSX
- **Presentations**: PPT, PPTX

## 🔒 Security Features

- ✅ JWT authentication with configurable expiration
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ File type and size validation
- ✅ Rate limiting to prevent abuse
- ✅ CORS configuration
- ✅ Helmet for security headers
- ✅ Role-based access control

## 📊 Database Models

### User Model Features
- Unique employee ID and email
- Password hashing
- Role management (user/admin)
- Profile information
- Activity tracking

### Document Model Features
- File metadata and storage
- Status workflow management
- User relationships
- Search capabilities
- Download tracking
- Category organization

## 🛠 Testing Your Backend

### 1. **Start the Server**
```bash
npm run dev
```
Server runs on `http://localhost:5000`

### 2. **Test with cURL or Postman**

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "TEST001",
    "name": "Test User",
    "email": "test@company.com", 
    "password": "Test123!",
    "department": "IT",
    "position": "Developer"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "TEST001",
    "password": "Test123!"
  }'
```

### 3. **Upload a Document**
Use the JWT token from login in the Authorization header:
```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "document=@path/to/your/file.pdf" \
  -F "title=Test Document" \
  -F "category=project_document"
```

## 🎮 Next Steps

### For Frontend Integration
1. **Authentication**: Use JWT tokens for API calls
2. **File Upload**: Use FormData for multipart uploads
3. **State Management**: Handle user roles and permissions
4. **UI Components**: Create forms for document upload and admin review

### For Production Deployment
1. **Environment**: Set production MongoDB URI
2. **Security**: Change JWT secret and other sensitive values
3. **Storage**: Consider cloud storage for files
4. **Monitoring**: Add logging and monitoring tools

## 📖 Documentation

- **README.md**: Complete setup and feature documentation
- **API_DOCS.md**: Detailed API endpoint documentation with examples
- **Code Comments**: Comprehensive inline documentation

## 🆘 Troubleshooting

### Common Issues
1. **MongoDB Connection**: Ensure MongoDB is running
2. **File Upload**: Check file size limits and supported types
3. **Authentication**: Verify JWT token format and expiration
4. **Permissions**: Check user roles for admin endpoints

### Support
All routes include comprehensive error handling with detailed error messages to help with debugging.

---

## 🎊 Congratulations!

You now have a fully functional office management system backend with:
- ✅ Complete user authentication system
- ✅ Robust document management with approval workflow  
- ✅ Comprehensive admin panel
- ✅ Production-ready security features
- ✅ Extensive documentation and examples

The backend is ready to be integrated with a frontend application and deployed to production! 🚀