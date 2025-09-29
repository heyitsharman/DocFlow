export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  position?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  profilePicture?: string;
  phoneNumber?: string;
  dateOfJoining: string;
  lastLogin?: string;
}

export interface Document {
  _id: string;
  title: string;
  description?: string;
  category: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  originalName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  uploadedBy: {
    _id: string;
    name: string;
    employeeId: string;
    department: string;
  };
  reviewedBy?: {
    _id: string;
    name: string;
    employeeId: string;
  };
  reviewDate?: string;
  reviewComments?: string;
  isArchived: boolean;
  hasFile: boolean;
  vendorDetails?: {
    vendorName?: string;
    vendorPhone?: string;
    vendorDate?: string;
    vendorNotes?: string;
  };
  downloadCount?: number;
  lastDownloadDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  errors?: string[];
}