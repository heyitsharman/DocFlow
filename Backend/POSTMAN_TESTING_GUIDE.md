# Complete Postman Testing Guide - Office Management System

## 🚀 Server Setup
**Base URL**: `http://localhost:5000/api`

First, make sure your server is running:
```bash
cd Backend
npm run dev
```

## 📋 Postman Environment Setup

### Create Environment Variables in Postman:
1. Go to Postman → Environments → Create Environment
2. Add these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `http://localhost:5000/api` | `http://localhost:5000/api` |
| `userToken` | | (will be set after login) |
| `adminToken` | | (will be set after admin login) |
| `documentId` | | (will be set after upload) |
| `userId` | | (will be set after registration) |

---

## 🔐 AUTHENTICATION ROUTES

### 1. User Registration
**Method**: `POST`  
**URL**: `{{baseUrl}}/auth/signup`  
**Headers**: `Content-Type: application/json`

**Raw JSON Body**:
```json
{
  "employeeId": "EMP001",
  "name": "John Doe",
  "email": "john.doe@company.com",
  "password": "User123!",
  "department": "Engineering",
  "position": "Software Developer",
  "phoneNumber": "+1234567890"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "employeeId": "EMP001",
      "name": "John Doe",
      "email": "john.doe@company.com",
      "department": "Engineering",
      "position": "Software Developer",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Post-Response Script** (Add to Tests tab):
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("userToken", response.data.token);
    pm.environment.set("userId", response.data.user.id);
}
```

---

### 2. Admin Registration (First Admin)
**Method**: `POST`  
**URL**: `{{baseUrl}}/auth/signup`  
**Headers**: `Content-Type: application/json`

**Raw JSON Body**:
```json
{
  "employeeId": "ADMIN001",
  "name": "System Administrator",
  "email": "admin@company.com",
  "password": "Admin123!",
  "department": "IT",
  "position": "System Administrator",
  "role": "admin",
  "phoneNumber": "+1234567891"
}
```

---

### 3. User Login
**Method**: `POST`  
**URL**: `{{baseUrl}}/auth/login`  
**Headers**: `Content-Type: application/json`

**Raw JSON Body**:
```json
{
  "employeeId": "EMP001",
  "password": "User123!"
}
```

**Post-Response Script**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("userToken", response.data.token);
}
```

---

### 4. Admin Login
**Method**: `POST`  
**URL**: `{{baseUrl}}/auth/login`  
**Headers**: `Content-Type: application/json`

**Raw JSON Body**:
```json
{
  "employeeId": "ADMIN001",
  "password": "Admin123!"
}
```

**Post-Response Script**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("adminToken", response.data.token);
}
```

---

### 5. Get User Profile
**Method**: `GET`  
**URL**: `{{baseUrl}}/auth/profile`  
**Headers**: `Authorization: Bearer {{userToken}}`

---

### 6. Update User Profile
**Method**: `PUT`  
**URL**: `{{baseUrl}}/auth/profile`  
**Headers**: 
- `Authorization: Bearer {{userToken}}`
- `Content-Type: application/json`

**Raw JSON Body**:
```json
{
  "name": "John Updated Doe",
  "department": "Engineering Updated",
  "position": "Senior Software Developer",
  "phoneNumber": "+1234567899"
}
```

---

### 7. Create Additional Admin (Admin Only)
**Method**: `POST`  
**URL**: `{{baseUrl}}/auth/admin/signup`  
**Headers**: 
- `Authorization: Bearer {{adminToken}}`
- `Content-Type: application/json`

**Raw JSON Body**:
```json
{
  "employeeId": "ADMIN002",
  "name": "HR Administrator",
  "email": "hr.admin@company.com",
  "password": "HRAdmin123!",
  "department": "Human Resources",
  "position": "HR Manager",
  "phoneNumber": "+1234567892"
}
```

---

## 📄 DOCUMENT MANAGEMENT ROUTES

### 8. Upload Document
**Method**: `POST`  
**URL**: `{{baseUrl}}/documents/upload`  
**Headers**: `Authorization: Bearer {{userToken}}`  
**Body Type**: `form-data`

**Form Data**:
| Key | Type | Value |
|-----|------|-------|
| `document` | File | (Select a PDF/Word/Image file) |
| `title` | Text | `Project Proposal Document` |
| `description` | Text | `This is a sample project proposal for Q4 2024` |
| `category` | Text | `project_document` |
| `priority` | Text | `high` |
| `tags` | Text | `["project", "proposal", "Q4", "2024"]` |
| `expiryDate` | Text | `2025-12-31T23:59:59.000Z` |

**Post-Response Script**:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("documentId", response.data.document._id);
}
```

---

### 9. Get User Documents
**Method**: `GET`  
**URL**: `{{baseUrl}}/documents?page=1&limit=10&sortBy=createdAt&sortOrder=desc`  
**Headers**: `Authorization: Bearer {{userToken}}`

---

### 10. Get User Documents with Filters
**Method**: `GET`  
**URL**: `{{baseUrl}}/documents?status=pending&category=project_document&page=1&limit=5`  
**Headers**: `Authorization: Bearer {{userToken}}`

---

### 11. Get Single Document
**Method**: `GET`  
**URL**: `{{baseUrl}}/documents/{{documentId}}`  
**Headers**: `Authorization: Bearer {{userToken}}`

---

### 12. Update Document
**Method**: `PUT`  
**URL**: `{{baseUrl}}/documents/{{documentId}}`  
**Headers**: 
- `Authorization: Bearer {{userToken}}`
- `Content-Type: application/json`

**Raw JSON Body**:
```json
{
  "title": "Updated Project Proposal Document",
  "description": "Updated description for the project proposal",
  "priority": "urgent",
  "tags": ["project", "proposal", "Q4", "2024", "updated"]
}
```

---

### 13. Search Documents
**Method**: `GET`  
**URL**: `{{baseUrl}}/documents/search/query?q=project&category=project_document&page=1&limit=10`  
**Headers**: `Authorization: Bearer {{userToken}}`

---

### 14. Download Document
**Method**: `GET`  
**URL**: `{{baseUrl}}/documents/{{documentId}}/download`  
**Headers**: `Authorization: Bearer {{userToken}}`

---

### 15. Delete Document (User)
**Method**: `DELETE`  
**URL**: `{{baseUrl}}/documents/{{documentId}}`  
**Headers**: `Authorization: Bearer {{userToken}}`

---

## 👨‍💼 ADMIN ROUTES

### 16. Admin Dashboard
**Method**: `GET`  
**URL**: `{{baseUrl}}/admin/dashboard`  
**Headers**: `Authorization: Bearer {{adminToken}}`

---

### 17. Get All Documents (Admin)
**Method**: `GET`  
**URL**: `{{baseUrl}}/admin/documents?page=1&limit=20&sortBy=createdAt&sortOrder=desc`  
**Headers**: `Authorization: Bearer {{adminToken}}`

---

### 18. Get Pending Documents (Admin)
**Method**: `GET`  
**URL**: `{{baseUrl}}/admin/documents?status=pending&page=1&limit=10`  
**Headers**: `Authorization: Bearer {{adminToken}}`

---

### 19. Get Documents by Department (Admin)
**Method**: `GET`  
**URL**: `{{baseUrl}}/admin/documents?department=Engineering&page=1&limit=10`  
**Headers**: `Authorization: Bearer {{adminToken}}`

---

### 20. Approve Document (Admin)
**Method**: `PUT`  
**URL**: `{{baseUrl}}/admin/documents/{{documentId}}/review`  
**Headers**: 
- `Authorization: Bearer {{adminToken}}`
- `Content-Type: application/json`

**Raw JSON Body**:
```json
{
  "status": "approved",
  "reviewComments": "Document looks good and meets all requirements. Approved for processing."
}
```

---

### 21. Reject Document (Admin)
**Method**: `PUT`  
**URL**: `{{baseUrl}}/admin/documents/{{documentId}}/review`  
**Headers**: 
- `Authorization: Bearer {{adminToken}}`
- `Content-Type: application/json`

**Raw JSON Body**:
```json
{
  "status": "rejected",
  "reviewComments": "Document is missing required signatures and proper formatting. Please resubmit with corrections."
}
```

---

### 22. Mark Document Under Review (Admin)
**Method**: `PUT`  
**URL**: `{{baseUrl}}/admin/documents/{{documentId}}/review`  
**Headers**: 
- `Authorization: Bearer {{adminToken}}`
- `Content-Type: application/json`

**Raw JSON Body**:
```json
{
  "status": "under_review",
  "reviewComments": "Document is currently being reviewed by the compliance team."
}
```

---

### 23. Get All Users (Admin)
**Method**: `GET`  
**URL**: `{{baseUrl}}/admin/users?page=1&limit=20`  
**Headers**: `Authorization: Bearer {{adminToken}}`

---

### 24. Get Users by Department (Admin)
**Method**: `GET`  
**URL**: `{{baseUrl}}/admin/users?department=Engineering&status=active`  
**Headers**: `Authorization: Bearer {{adminToken}}`

---

### 25. Search Users (Admin)
**Method**: `GET`  
**URL**: `{{baseUrl}}/admin/users?search=john&page=1&limit=10`  
**Headers**: `Authorization: Bearer {{adminToken}}`

---

### 26. Deactivate User (Admin)
**Method**: `PUT`  
**URL**: `{{baseUrl}}/admin/users/{{userId}}/status`  
**Headers**: 
- `Authorization: Bearer {{adminToken}}`
- `Content-Type: application/json`

**Raw JSON Body**:
```json
{
  "isActive": false
}
```

---

### 27. Activate User (Admin)
**Method**: `PUT`  
**URL**: `{{baseUrl}}/admin/users/{{userId}}/status`  
**Headers**: 
- `Authorization: Bearer {{adminToken}}`
- `Content-Type: application/json`

**Raw JSON Body**:
```json
{
  "isActive": true
}
```

---

### 28. Generate Summary Report (Admin)
**Method**: `GET`  
**URL**: `{{baseUrl}}/admin/reports/summary?startDate=2024-01-01&endDate=2024-12-31&department=Engineering`  
**Headers**: `Authorization: Bearer {{adminToken}}`

---

### 29. Delete Document (Admin)
**Method**: `DELETE`  
**URL**: `{{baseUrl}}/admin/documents/{{documentId}}`  
**Headers**: `Authorization: Bearer {{adminToken}}`

---

## 🔍 HEALTH CHECK

### 30. Health Check
**Method**: `GET`  
**URL**: `{{baseUrl}}/health`  
**No Headers Required**

**Expected Response**:
```json
{
  "status": "OK",
  "message": "Office Management System API is running",
  "timestamp": "2025-09-25T10:30:00.000Z"
}
```

---

## 🧪 COMPLETE TESTING WORKFLOW

### Step 1: Basic Setup
1. Health Check (Route 30)
2. Register Admin (Route 2)
3. Register User (Route 1)

### Step 2: Authentication
4. Login as Admin (Route 4)
5. Login as User (Route 3)
6. Get User Profile (Route 5)

### Step 3: Document Management
7. Upload Document (Route 8)
8. Get User Documents (Route 9)
9. Update Document (Route 12)

### Step 4: Admin Operations
10. Admin Dashboard (Route 16)
11. Get All Documents as Admin (Route 17)
12. Approve Document (Route 20)
13. Get All Users (Route 23)

### Step 5: Advanced Features
14. Search Documents (Route 13)
15. Download Document (Route 14)
16. Generate Report (Route 28)

---

## 📝 SAMPLE TEST DATA SETS

### Additional Users for Testing:
```json
{
  "employeeId": "EMP002",
  "name": "Jane Smith",
  "email": "jane.smith@company.com",
  "password": "User123!",
  "department": "Marketing",
  "position": "Marketing Manager",
  "phoneNumber": "+1234567893"
}
```

```json
{
  "employeeId": "EMP003",
  "name": "Mike Johnson",
  "email": "mike.johnson@company.com",
  "password": "User123!",
  "department": "HR",
  "position": "HR Specialist",
  "phoneNumber": "+1234567894"
}
```

### Document Categories to Test:
- `leave_application`
- `expense_report`
- `project_document`
- `personal_document`
- `compliance`
- `hr_document`
- `finance_document`
- `other`

### Document Priorities to Test:
- `low`
- `medium`
- `high`
- `urgent`

---

## 🚨 COMMON ERROR RESPONSES

### 401 Unauthorized:
```json
{
  "success": false,
  "message": "Access token is required"
}
```

### 403 Forbidden:
```json
{
  "success": false,
  "message": "Admin access required"
}
```

### 400 Bad Request:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Password must be at least 6 characters long",
      "param": "password"
    }
  ]
}
```

### 404 Not Found:
```json
{
  "success": false,
  "message": "Document not found"
}
```

---

## 🎯 TESTING TIPS

1. **Run tests in order** - Authentication first, then documents
2. **Save tokens** - Use environment variables for tokens
3. **Test file uploads** - Use actual PDF/Word/Image files
4. **Check error cases** - Try invalid data, expired tokens
5. **Test permissions** - Try user accessing admin routes
6. **Monitor server logs** - Check console for detailed errors

Your MongoDB Atlas connection is set up correctly! Start with the Health Check route and work through the authentication routes first. 🚀