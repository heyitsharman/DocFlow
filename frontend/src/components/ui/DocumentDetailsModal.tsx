'use client'

import { useState, useEffect } from 'react'
import { Document } from '@/lib/types'
import api from '@/lib/api'

interface DocumentDetailsModalProps {
  documentId: string
  isOpen: boolean
  onClose: () => void
  isAdmin?: boolean
  onDownload?: (documentId: string, fileName: string) => void
}

export default function DocumentDetailsModal({ 
  documentId, 
  isOpen, 
  onClose, 
  isAdmin = false,
  onDownload 
}: DocumentDetailsModalProps) {
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && documentId) {
      fetchDocumentDetails()
    }
  }, [isOpen, documentId])

  const fetchDocumentDetails = async () => {
    try {
      setLoading(true)
      setError('')
      
      const endpoint = isAdmin 
        ? `/admin/documents/${documentId}/details`
        : `/documents/${documentId}`
      
      const response = await api.get(endpoint)
      setDocument(response.data.data.document)
    } catch (error: any) {
      console.error('Error fetching document details:', error)
      setError(error.response?.data?.message || 'Failed to load document details')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Document Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : document ? (
            <div className="space-y-6">
              {/* Header Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {document.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                        {document.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className={`font-medium ${getPriorityColor(document.priority || 'medium')}`}>
                        {(document.priority || 'medium').toUpperCase()} Priority
                      </span>
                      {!document.hasFile && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          DETAILS ONLY
                        </span>
                      )}
                    </div>
                  </div>
                  {document.hasFile && onDownload && (
                    <button
                      onClick={() => onDownload(document._id, document.originalName || 'document')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>
                  )}
                </div>
              </div>

              {/* File Information */}
              {document.hasFile && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">File Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Original Name:</span>
                      <p className="text-gray-600">{document.originalName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">File Size:</span>
                      <p className="text-gray-600">
                        {document.fileSize ? (document.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">File Type:</span>
                      <p className="text-gray-600">{document.mimeType || 'N/A'}</p>
                    </div>
                    {document.downloadCount && document.downloadCount > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">Downloads:</span>
                        <p className="text-gray-600">{document.downloadCount} times</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Document Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Document Information</h4>
                  
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <p className="text-gray-600 capitalize">
                      {document.category.replace(/_/g, ' ')}
                    </p>
                  </div>

                  {document.description && (
                    <div>
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="text-gray-600">{document.description}</p>
                    </div>
                  )}

                  <div>
                    <span className="font-medium text-gray-700">Uploaded:</span>
                    <p className="text-gray-600">{formatDate(document.createdAt)}</p>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Uploaded By:</span>
                    <p className="text-gray-600">
                      {document.uploadedBy.name} ({document.uploadedBy.employeeId})
                    </p>
                    <p className="text-sm text-gray-500">{document.uploadedBy.department}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Review Information</h4>
                  
                  {document.reviewedBy ? (
                    <>
                      <div>
                        <span className="font-medium text-gray-700">Reviewed By:</span>
                        <p className="text-gray-600">
                          {document.reviewedBy.name} ({document.reviewedBy.employeeId})
                        </p>
                      </div>

                      {document.reviewDate && (
                        <div>
                          <span className="font-medium text-gray-700">Review Date:</span>
                          <p className="text-gray-600">{formatDate(document.reviewDate)}</p>
                        </div>
                      )}

                      {document.reviewComments && (
                        <div>
                          <span className="font-medium text-gray-700">Comments:</span>
                          <p className="text-gray-600">{document.reviewComments}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 italic">Awaiting review</p>
                  )}
                </div>
              </div>

              {/* Vendor Details */}
              {document.vendorDetails && (
                document.vendorDetails.vendorName || 
                document.vendorDetails.vendorPhone || 
                document.vendorDetails.vendorNotes
              ) && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Vendor Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {document.vendorDetails.vendorName && (
                      <div>
                        <span className="font-medium text-gray-700">Vendor Name:</span>
                        <p className="text-gray-600">{document.vendorDetails.vendorName}</p>
                      </div>
                    )}
                    {document.vendorDetails.vendorPhone && (
                      <div>
                        <span className="font-medium text-gray-700">Phone:</span>
                        <p className="text-gray-600">{document.vendorDetails.vendorPhone}</p>
                      </div>
                    )}
                    {document.vendorDetails.vendorDate && (
                      <div>
                        <span className="font-medium text-gray-700">Date:</span>
                        <p className="text-gray-600">{formatDate(document.vendorDetails.vendorDate)}</p>
                      </div>
                    )}
                    {document.vendorDetails.vendorNotes && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Notes:</span>
                        <p className="text-gray-600">{document.vendorDetails.vendorNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}