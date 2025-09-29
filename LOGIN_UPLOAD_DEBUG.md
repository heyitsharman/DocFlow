# 🚨 Login & Upload Error Troubleshooting Guide

## Current Issues Identified

### 1. 400 Error on Document Upload
**Location**: `src/app/upload/page.tsx` line 111
**Error**: "Request failed with status code 400"

### 2. Potential Login Issues
**Symptoms**: May affect ability to authenticate for uploads

## 🔧 Debug Features Added

### Frontend Upload Debugging
Added comprehensive logging to upload function:
- Form data values (title, category, etc.)
- File selection status  
- Save without file checkbox status
- hasFile parameter being sent

### Backend Upload Debugging  
Added logging to upload route:
- Request body contents
- File upload status
- User authentication details
- Validation error details

## 🧪 Testing Steps

### Step 1: Test Login
1. Open browser console
2. Try logging in with credentials
3. Check console for login attempt logs:
   ```
   "Attempting login with: {employeeId: '...'}"
   "Login response: {...}"
   ```
4. Look for any error messages

### Step 2: Test Upload (After Successful Login)
1. Go to upload page with console open
2. Fill in required fields:
   - Title (required)
   - Category (required - select from dropdown)
   - Description (optional)
3. Try uploading:
   - **With file**: Select file, leave "Save without file" unchecked
   - **Without file**: Check "Save without file" checkbox
4. Check console for upload logs:
   ```
   "Upload form data:"
   "- Title: ..."
   "- Category: ..."  
   "- Has file: true/false"
   "- Selected file: true/false"
   "- Save without file: true/false"
   ```

### Step 3: Check Backend Logs
In backend terminal, look for:
```
"Upload request received:"
"- Body: {...}"
"- File: true/false"  
"- User: username"
"Validation errors: [...]" (if any)
```

## 🎯 Common Issues & Solutions

### 400 Error Causes:
1. **Validation Failure**
   - Missing required fields (title, category)
   - Invalid category value
   - Invalid priority value

2. **Authentication Issues** 
   - Not logged in properly
   - Auth token expired/invalid
   - User not found

3. **File Upload Logic**
   - Conflicting hasFile parameter
   - File required but not provided
   - File provided but marked as "no file"

### Login Issues:
1. **Invalid Credentials**
   - Wrong employee ID or password
   - User doesn't exist in database

2. **Backend Connection**
   - Backend server not running
   - CORS issues
   - Network connectivity

## 🔍 Debug Checklist

### Before Upload:
- [ ] User successfully logged in
- [ ] Auth token exists in cookies  
- [ ] Console shows no login errors
- [ ] Backend server running (port 5000)

### During Upload:
- [ ] Title field filled (required)
- [ ] Category selected (required)
- [ ] Either file selected OR "save without file" checked
- [ ] Console shows upload form data
- [ ] Backend shows request received

### Validation Requirements:
- [ ] Title: 1-200 characters
- [ ] Description: max 1000 characters (optional)
- [ ] Category: valid option from dropdown
- [ ] Priority: low/medium/high/urgent (optional)
- [ ] File: required unless "save without file" checked

## 🚀 Next Steps

1. **Try Login First** - Check console for login success/failure
2. **Test Upload** - Use debug console output to identify exact failure point
3. **Check Backend Logs** - See what the server is receiving
4. **Report Findings** - Share console output and backend logs for further diagnosis

## 📝 Test User (if needed)
If no users exist, we may need to:
- Create test user via registration
- Check database for existing users
- Use seed script if available

**Backend Debug Status**: ✅ Active
**Frontend Debug Status**: ✅ Active  
**Server Status**: ✅ Running on port 5000