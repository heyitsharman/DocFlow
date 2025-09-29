'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import api from '@/lib/api'

export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    tags: '',
    vendorName: '',
    vendorPhone: '',
    vendorDate: '',
    vendorNotes: ''
  })
  const [saveWithoutFile, setSaveWithoutFile] = useState(false)

  const categories = [
    { value: 'leave_application', label: 'Leave Application' },
    { value: 'expense_report', label: 'Expense Report' },
    { value: 'project_document', label: 'Project Document' },
    { value: 'personal_document', label: 'Personal Document' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'hr_document', label: 'HR Document' },
    { value: 'finance_document', label: 'Finance Document' },
    { value: 'other', label: 'Other' }
  ]

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      // Auto-fill title from filename if empty
      if (!formData.title) {
        const fileName = file.name.split('.').slice(0, -1).join('.')
        setFormData(prev => ({ ...prev, title: fileName }))
      }
      setError('')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpload = async () => {
    if (!selectedFile && !saveWithoutFile) {
      setError('Please select a file to upload or enable "Save without file"')
      return
    }

    if (!formData.title.trim()) {
      setError('Document title is required')
      return
    }

    if (!formData.category) {
      setError('Please select a document category')
      return
    }
    
    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const uploadFormData = new FormData()
      
      // Only append file if one is selected
      if (selectedFile) {
        uploadFormData.append('document', selectedFile)
      }
      
      uploadFormData.append('title', formData.title)
      uploadFormData.append('description', formData.description)
      uploadFormData.append('category', formData.category)
      uploadFormData.append('priority', formData.priority)
      uploadFormData.append('hasFile', saveWithoutFile ? 'false' : 'true')
      
      // Add vendor details
      uploadFormData.append('vendorName', formData.vendorName)
      uploadFormData.append('vendorPhone', formData.vendorPhone)
      uploadFormData.append('vendorDate', formData.vendorDate)
      uploadFormData.append('vendorNotes', formData.vendorNotes)
      
      // Parse tags from comma-separated string
      if (formData.tags.trim()) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        uploadFormData.append('tags', JSON.stringify(tagsArray))
      }

      const response = await api.post('/documents/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setSuccess('Document uploaded successfully! It will be reviewed by an administrator.')
      
      // Reset form
      setSelectedFile(null)
      setSaveWithoutFile(false)
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        tags: '',
        vendorName: '',
        vendorPhone: '',
        vendorDate: '',
        vendorNotes: ''
      })

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      // Redirect to documents page after 2 seconds
      setTimeout(() => {
        router.push('/documents')
      }, 2000)

    } catch (error: any) {
      console.error('Upload failed:', error)
      setError(error.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Document</h1>
          <p className="text-gray-600 mt-2">Upload and manage your documents securely</p>
        </div>

        {error && (
          <div className="max-w-2xl mb-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="max-w-2xl mb-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          </div>
        )}

        <div className="max-w-2xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* File Upload Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Document {!saveWithoutFile && '*'}
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={saveWithoutFile}
                    onChange={(e) => setSaveWithoutFile(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-600">Save without file</span>
                </label>
              </div>
              
              {!saveWithoutFile && (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          onChange={handleFileSelect}
                          className="sr-only"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT, JPG, PNG up to 10MB</p>
                  </div>
                </div>
              )}
              
              {saveWithoutFile && (
                <div className="mt-1 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    📝 You can save document details without uploading a file. This is useful for tracking document requests or pending documents.
                  </p>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="mb-6">
                <div className="rounded-md bg-blue-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1 md:flex md:justify-between">
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Selected:</span> {selectedFile.name}
                      </p>
                      <p className="mt-1 text-sm text-blue-700 md:mt-0 md:ml-6">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Information Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter document title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the document"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (optional)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., urgent, finance, quarterly (comma-separated)"
                />
                <p className="mt-1 text-xs text-gray-500">Separate multiple tags with commas</p>
              </div>
            </div>

            {/* Vendor Details Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vendor Details (Optional)</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Name
                    </label>
                    <input
                      type="text"
                      name="vendorName"
                      value={formData.vendorName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter vendor name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Phone
                    </label>
                    <input
                      type="tel"
                      name="vendorPhone"
                      value={formData.vendorPhone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter vendor phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor Date
                  </label>
                  <input
                    type="date"
                    name="vendorDate"
                    value={formData.vendorDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor Notes
                  </label>
                  <textarea
                    name="vendorNotes"
                    value={formData.vendorNotes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes about the vendor"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {((selectedFile || saveWithoutFile) && formData.title && formData.category) ? 
                    'Ready to upload' : 'Please complete all required fields'}
                </div>
                <button
                  onClick={handleUpload}
                  disabled={!(selectedFile || saveWithoutFile) || !formData.title || !formData.category || uploading}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {uploading ? (saveWithoutFile ? 'Saving...' : 'Uploading...') : (saveWithoutFile ? 'Save Details' : 'Upload Document')}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Upload Guidelines</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Maximum file size: 10MB</li>
              <li>• Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG</li>
              <li>• All documents require admin approval</li>
              <li>• You can track approval status in "My Documents"</li>
              <li>• Files are automatically scanned for security</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}
