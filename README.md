# DocFlow Pro - Document Management System

> A comprehensive, enterprise-grade document management system with vendor tracking, approval workflows, and advanced file handling capabilities.

## 🌐 Live Demo

- **Frontend**: [https://doc-flow-r5e6.vercel.app/](https://doc-flow-r5e6.vercel.app/)
- **Backend API**: Railway Deployment (Auto-deployed from main branch)

## 📋 Table of Contents

- [Features Overview](#-features-overview)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Frontend Features](#-frontend-features)
- [Backend Features](#-backend-features)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [License](#-license)
- [Open to Contributions](#-open-to-contributions)

## ✨ Features Overview

### 🔐 Authentication & Authorization
- JWT-based authentication with role-based access control
- User and Admin role management
- Secure login/logout functionality
- Protected routes and API endpoints

### 📄 Document Management
- **Upload with Vendor Details**: Add vendor name, phone, date alongside documents
- **Flexible File Upload**: Save document details with or without file attachments
- **Download Functionality**: Secure document download for users and admins
- **Document Details Modal**: Comprehensive view of all document information
- **Status Workflow**: Pending → Approved/Rejected admin workflow
- **Search & Filter**: Advanced filtering by status, category, department

### 👥 User Management
- Employee registration with department and position
- Profile management and updates
- Admin panel for user oversight
- Department-based document access

### 📊 Admin Panel
- Document approval/rejection workflow
- User management and oversight
- System analytics and reporting
- Bulk operations and management tools

## 🛠 Technology Stack

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

## 🏗 Architecture

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

## 🎨 Frontend Features

### Pages & Routes
- **`/`** - Landing page
- **`/auth/login`** - User login
- **`/auth/register`** - User registration
- **`/dashboard`** - User dashboard with statistics
- **`/documents`** - Document listing with download and view options
- **`/upload`** - Document upload with vendor details
- **`/admin`** - Admin dashboard
- **`/admin/documents`** - Admin document management

### Key Components
- **DocumentDetailsModal**: Comprehensive document information display
- **Layout & Sidebar**: Responsive navigation system
- **AuthContext**: Global authentication state management
- **UI Components**: Reusable button, card, and input components


### Document Management Features
- ✅ View document details in modal
- ✅ Download documents (if file exists)
- ✅ Track download counts
- ✅ Filter by status and category
- ✅ Responsive design for all devices

## ⚙ Backend Features

### API Endpoints

#### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /logout` - User logout

#### Document Routes (`/api/documents`)
- `POST /upload` - Upload document with vendor details
- `GET /` - Get user documents with filtering
- `GET /:id/download` - Download document file
- `GET /:id/details` - Get document details
- `PUT /:id` - Update document
- `DELETE /:id` - Delete document

#### Admin Routes (`/api/admin`)
- `GET /documents` - Get all documents for admin review
- `PUT /documents/:id/approve` - Approve document
- `PUT /documents/:id/reject` - Reject document
- `GET /documents/:id/download` - Admin download access
- `GET /users` - Get all users
- `PUT /users/:id` - Update user details

### Database Schema

#### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  employeeId: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin']),
  department: String,
  position: String,
  isActive: Boolean,
  lastLogin: Date,
  timestamps: true
}
```

#### Document Model
```javascript
{
  title: String (required),
  description: String,
  category: String (enum),
  priority: String (enum),
  tags: [String],
  
  // File Information
  hasFile: Boolean,
  fileName: String (conditional),
  originalName: String (conditional),
  filePath: String (conditional),
  fileSize: Number (conditional),
  mimeType: String (conditional),
  
  // Vendor Details
  vendorDetails: {
    vendorName: String,
    vendorPhone: String,
    vendorDate: Date,
    vendorNotes: String
  },
  
  // Workflow
  status: String (enum: ['pending', 'approved', 'rejected']),
  uploadedBy: ObjectId (ref: 'User'),
  reviewedBy: ObjectId (ref: 'User'),
  reviewDate: Date,
  reviewComments: String,
  
  // Analytics
  downloadCount: Number (default: 0),
  lastDownloadDate: Date,
  
  timestamps: true
}
```

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

### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Deployment
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🌐 Deployment

### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### Railway (Backend)
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

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

### Project Structure
```
DocFlow/
├── Backend/
│   ├── middleware/       # Authentication, upload, validation
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── uploads/         # File storage
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js pages
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   └── lib/         # Utilities and types
│   └── public/          # Static assets
└── README.md
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Open to Contributions

This project is actively maintained and welcomes contributions from the community! Whether you're a beginner or an experienced developer, there are many ways to contribute:

### 🚀 Ways to Contribute
- **🐛 Bug Reports**: Found a bug? Please open an issue with detailed steps to reproduce
- **💡 Feature Requests**: Have an idea for a new feature? Share it with us!
- **📝 Documentation**: Help improve our documentation and guides
- **🛠️ Code Contributions**: Submit pull requests for bug fixes or new features
- **🧪 Testing**: Help test new features and report feedback
- **💬 Community Support**: Help answer questions and support other users

### 📬 Get In Touch
- **GitHub**: [@heyitsharman](https://github.com/heyitsharman)
- **Email**: [harmankaur0779@gmail.com](mailto:harmankaur0779@gmail.com)
- **Issues**: Open an issue on this repository for any questions or suggestions

### 🌟 Contributing Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature-name`)
3. Make your changes with clear, descriptive commits
4. Test your changes thoroughly
5. Submit a pull request with a detailed description

We appreciate all contributions, no matter how small! Every bit of help makes DocFlow Pro better for everyone. 💙

---

**DocFlow Pro** - Making document management simple, secure, and efficient. 🚀

For support or questions, please open an issue on GitHub.