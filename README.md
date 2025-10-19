# DocFlow Pro - Document Management System

> A comprehensive, enterprise-grade document management system with vendor tracking, approval workflows, and advanced file handling capabilities.

## Live Demo

- **Frontend**: [https://doc-flow-r5e6.vercel.app/](https://doc-flow-r5e6.vercel.app/)
- **Backend API**: Railway Deployment (Auto-deployed from main branch)


## Features Overview

###  Authentication & Authorization
- JWT-based authentication with role-based access control
- User and Admin role management
- Secure login/logout functionality
- Protected routes and API endpoints

### Document Management
- **Upload with Vendor Details**: Add vendor name, phone, date alongside documents
- **Flexible File Upload**: Save document details with or without file attachments
- **Download Functionality**: Secure document download for users and admins
- **Document Details Modal**: Comprehensive view of all document information
- **Status Workflow**: Pending → Approved/Rejected admin workflow
- **Search & Filter**: Advanced filtering by status, category, department

### User Management
- Employee registration with department and position
- Profile management and updates
- Admin panel for user oversight
- Department-based document access

### Admin Panel
- Document approval/rejection workflow
- User management and oversight
- System analytics and reporting
- Bulk operations and management tools

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.4 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Authentication**: JWT with HTTP-only cookies
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer middleware
- **Validation**: Express-validator
- **Security**: Helmet, CORS, bcryptjs
- **Deployment**: Railway

### Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Code Quality**: ESLint, TypeScript
- **Environment**: dotenv for configuration

## Architecture

```
DocFlow Pro
├── Frontend (Next.js)
│   ├── Authentication Layer
│   ├── Document Management UI
│   ├── Admin Dashboard
│   └── User Interface Components
├── Backend (Express.js)
│   ├── Authentication API
│   ├── Document API
│   ├── Admin API
│   └── File Storage System
└── Database (MongoDB)
    ├── Users Collection
    ├── Documents Collection
    └── File Metadata
```

##  Frontend Features

### Key Components
- **DocumentDetailsModal**: Comprehensive document information display
- **Layout & Sidebar**: Responsive navigation system
- **AuthContext**: Global authentication state management
- **UI Components**: Reusable button, card, and input components

### Document Management Features
- View document details in modal
- Download documents (if file exists)
- Track download counts
- Filter by status and category
- Responsive design for all devices

## Backend Features

### Security Features
- Password hashing with bcryptjs
- JWT token authentication
- Protected routes with middleware
- File upload validation and sanitization
- CORS configuration for cross-origin requests
- Helmet for security headers

## 🚀 Installation & Setup

### Full Stack Setup
```bash
# Clone repository
git clone <repository-url>
cd DocFlow

# Install backend dependencies
cd Backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Start both servers
# Terminal 1: Backend
cd Backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/docflow
# or MongoDB Atlas URI

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_PATH=./uploads

# CORS
FRONTEND_URL=http://localhost:3000
```

## Deployment

### Environment Configuration for Production
```env
# Production Backend
MONGODB_URI=<production-mongodb-uri>
JWT_SECRET=<production-jwt-secret>
FRONTEND_URL=https://doc-flow-r5e6.vercel.app

# Production Frontend
NEXT_PUBLIC_API_URL=<production-backend-url>
```

## 📚 API Documentation

### Quick API Reference

#### Authentication
```bash
# Register user
POST /api/auth/register
Content-Type: application/json
{
  "name": "John Doe",
  "email": "john@company.com",
  "employeeId": "EMP001",
  "password": "password123",
  "department": "IT",
  "position": "Developer"
}

# Login
POST /api/auth/login
Content-Type: application/json
{
  "employeeId": "EMP001",
  "password": "password123"
}
```


### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Get In Touch
- **GitHub**: [@heyitsharman](https://github.com/heyitsharman)
- **Email**: [harmankaur0779@gmail.com](mailto:harmankaur0779@gmail.com)
- **Issues**: Open an issue on this repository for any questions or suggestions

