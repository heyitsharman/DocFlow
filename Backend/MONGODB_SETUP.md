# MongoDB Setup Guide for Office Management System

## ✅ MongoDB Integration Status
Your backend is **already fully integrated** with MongoDB! All user and admin data is stored in MongoDB using Mongoose ODM.

## 🗄️ Database Collections

### Users Collection
Stores all user and admin accounts with:
- Employee ID (unique identifier)
- Personal information (name, email, department, position)
- Authentication data (hashed passwords)
- Role management (user/admin)
- Activity tracking (last login, created date)

### Documents Collection
Stores all document metadata with:
- File information (name, path, size, type)
- Document details (title, description, category)
- Workflow status (pending, approved, rejected, under_review)
- User relationships (uploaded by, reviewed by)
- Search and filtering data

## 🔧 MongoDB Configuration Options

### Option 1: Local MongoDB
Update your `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/office_management
```

### Option 2: MongoDB Atlas (Cloud)
Update your `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/office_management?retryWrites=true&w=majority
```

### Option 3: Custom MongoDB Server
Update your `.env` file:
```env
MONGODB_URI=mongodb://your-server-ip:27017/office_management
```

### Option 4: Authentication Required
Update your `.env` file:
```env
MONGODB_URI=mongodb://username:password@your-server:27017/office_management
```

## 🚀 Quick Start Steps

### 1. Install MongoDB (if using local)
- **Windows**: Download from MongoDB official website
- **macOS**: `brew install mongodb-community`
- **Linux**: Use package manager or Docker

### 2. Start MongoDB Service
- **Windows**: Start MongoDB service from Services
- **macOS/Linux**: `brew services start mongodb-community` or `sudo systemctl start mongod`
- **Docker**: `docker run -d -p 27017:27017 mongo`

### 3. Update Environment Variables
Edit your `.env` file with your MongoDB connection string:
```env
# Local MongoDB (default - already set)
MONGODB_URI=mongodb://localhost:27017/office_management

# OR your custom MongoDB URL
MONGODB_URI=your_mongodb_connection_string_here
```

### 4. Test Connection
```bash
npm run dev
```
You should see: `Connected to MongoDB` in the console.

### 5. Seed Initial Data (Optional)
```bash
npm run seed
```

## 📊 Database Schema Details

### User Schema
```javascript
{
  _id: ObjectId,
  employeeId: String (unique, uppercase),
  name: String (required),
  email: String (unique, lowercase),
  password: String (hashed with bcrypt),
  department: String (required),
  position: String (required),
  role: String ('user' | 'admin'),
  isActive: Boolean (default: true),
  phoneNumber: String,
  profilePicture: String,
  dateOfJoining: Date,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Document Schema
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  fileName: String (system generated),
  originalName: String (user uploaded name),
  filePath: String (server file path),
  fileSize: Number (bytes),
  mimeType: String,
  fileType: String ('pdf', 'doc', 'docx', 'image', 'other'),
  category: String (predefined categories),
  status: String ('pending', 'approved', 'rejected', 'under_review'),
  priority: String ('low', 'medium', 'high', 'urgent'),
  uploadedBy: ObjectId (ref: User),
  reviewedBy: ObjectId (ref: User),
  reviewDate: Date,
  reviewComments: String,
  tags: [String],
  isArchived: Boolean,
  expiryDate: Date,
  downloadCount: Number,
  lastDownloadDate: Date,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔍 Database Indexes (Already Configured)

### User Indexes
- `employeeId` (unique)
- `email` (unique)
- `department`

### Document Indexes
- `uploadedBy + createdAt` (compound)
- `status + createdAt` (compound)
- `category + createdAt` (compound)
- `reviewedBy + reviewDate` (compound)
- `tags`
- Full-text search on `title`, `description`, `tags`

## 🛠️ MongoDB Management Tools

### 1. MongoDB Compass (GUI)
- Download from MongoDB website
- Connect using your connection string
- Visual database management

### 2. Command Line
```bash
# Connect to local MongoDB
mongo

# Use your database
use office_management

# View collections
show collections

# View users
db.users.find().pretty()

# View documents
db.documents.find().pretty()
```

### 3. Studio 3T (Third-party GUI)
Professional MongoDB IDE with advanced features

## 📈 Database Operations Already Implemented

### User Operations
- ✅ Create user/admin accounts
- ✅ Authenticate with password hashing
- ✅ Update user profiles
- ✅ Activate/deactivate accounts
- ✅ Track login activity

### Document Operations
- ✅ Upload documents with metadata
- ✅ Search and filter documents
- ✅ Update document status workflow
- ✅ Track document downloads
- ✅ Archive/delete documents

### Admin Operations
- ✅ Dashboard statistics aggregation
- ✅ Bulk document operations
- ✅ User management queries
- ✅ Report generation with filtering
- ✅ Cross-collection data joins

## 🔧 Troubleshooting

### Connection Issues
1. **Check MongoDB is running**: `ps aux | grep mongod` (Linux/Mac) or Task Manager (Windows)
2. **Verify connection string**: Ensure URL format is correct
3. **Check network**: Ensure MongoDB port (27017) is accessible
4. **Authentication**: Verify username/password if required

### Performance Tips
1. **Indexes are pre-configured** for optimal query performance
2. **Pagination is implemented** for large data sets
3. **Aggregation pipelines** used for complex reports
4. **Connection pooling** handled by Mongoose

### Monitoring
- Check server logs for MongoDB connection status
- Monitor database size and performance
- Set up alerts for connection failures

## 🎯 Next Steps

1. **Set your MongoDB URL** in `.env` file
2. **Start your MongoDB service**
3. **Run the backend**: `npm run dev`
4. **Verify connection**: Look for "Connected to MongoDB" message
5. **Seed data** (optional): `npm run seed`
6. **Test API endpoints** with your MongoDB data

Your MongoDB integration is complete and production-ready! 🚀