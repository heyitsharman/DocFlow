'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/layout/Layout'
import api from '@/lib/api'

interface Document {
  _id: string
  title: string
  filename: string
  originalName: string
  uploadedBy: {
    _id: string
    name: string
    employeeId: string
    department: string
  }
  uploadDate: string
  size: number
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: {
    name: string
    employeeId: string
  }
  approvalDate?: string
  rejectionReason?: string
}

export default function AdminDocumentsPage() {
  const { isAdmin, user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    if (isAdmin) {
      fetchDocuments()
    }
  }, [isAdmin])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/documents')
      console.log('API response:', response.data)
      // The backend returns { success: true, data: { documents: [...] } }
      const documentsData = response.data?.data?.documents || []
      setDocuments(documentsData)
    } catch (error) {
      console.error('Error fetching documents:', error)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (documentId: string) => {
    try {
      await api.put(`/admin/documents/${documentId}/review`, {
        status: 'approved'
      })
      await fetchDocuments() // Refresh the list
    } catch (error) {
      console.error('Error approving document:', error)
      setError('Failed to approve document')
    }
  }

  const handleReject = async (documentId: string, reason?: string) => {
    try {
      await api.put(`/admin/documents/${documentId}/review`, {
        status: 'rejected',
        reviewComments: reason
      })
      await fetchDocuments() // Refresh the list
    } catch (error) {
      console.error('Error rejecting document:', error)
      setError('Failed to reject document')
    }
  }



  const filteredDocuments = (documents || []).filter(doc => {
    if (filter === 'all') return true
    return doc.status === filter
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have admin privileges</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Documents</h1>
          <p className="text-gray-600 mt-2">Manage and review all uploaded documents</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === status
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {status === 'all' ? documents.length : documents.filter(d => d.status === status).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading documents...</span>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'all' ? 'No documents have been uploaded yet.' : `No ${filter} documents found.`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Upload Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDocuments.map((document) => (
                      <tr key={document._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{document.title || document.originalName}</div>
                              <div className="text-sm text-gray-500">{document.filename}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{document.uploadedBy.name}</div>
                          <div className="text-sm text-gray-500">{document.uploadedBy.employeeId} • {document.uploadedBy.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(document.uploadDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(document.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(document.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {document.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApprove(document._id)}
                                className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason:')
                                  if (reason) handleReject(document._id, reason)
                                }}
                                className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {document.status === 'approved' && document.approvedBy && (
                            <div className="text-sm text-gray-500">
                              Approved by {document.approvedBy.name}
                              <br />
                              <span className="text-xs">{document.approvalDate && formatDate(document.approvalDate)}</span>
                            </div>
                          )}
                          {document.status === 'rejected' && (
                            <div className="text-sm text-red-600">
                              Rejected
                              {document.rejectionReason && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Reason: {document.rejectionReason}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}