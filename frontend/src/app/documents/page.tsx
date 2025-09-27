'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/layout/Layout'
import api from '@/lib/api'

interface Document {
  _id: string
  title: string
  originalName: string
  fileSize: number
  category: string
  priority: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  createdAt: string
  reviewedBy?: {
    name: string
    employeeId: string
  }
  reviewDate?: string
  reviewComments?: string
  tags?: string[]
}

export default function DocumentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/documents')
      console.log('Documents response:', response.data)
      const documentsData = response.data?.data?.documents || []
      setDocuments(documentsData)
    } catch (error) {
      console.error('Error fetching documents:', error)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadClick = () => {
    router.push('/upload')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
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

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true
    return doc.status === filter
  })

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-600 mt-2">View and manage your uploaded documents</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All Documents' },
              { key: 'pending', label: 'Pending' },
              { key: 'approved', label: 'Approved' },
              { key: 'rejected', label: 'Rejected' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
                {key !== 'all' && (
                  <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                    {documents.filter(doc => doc.status === key).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Document List ({filteredDocuments.length})
              </h2>
              <button 
                onClick={handleUploadClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Upload New
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {filter === 'all' ? 'No documents' : `No ${filter} documents`}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'all' 
                    ? 'Get started by uploading your first document.' 
                    : `You don't have any ${filter} documents yet.`
                  }
                </p>
                {filter === 'all' && (
                  <div className="mt-6">
                    <button 
                      onClick={handleUploadClick}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Upload Document
                    </button>
                  </div>
                )}
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
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Upload Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Review Info
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                            <div className="text-sm text-gray-500">{doc.originalName}</div>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-gray-400">
                                {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                              </span>
                              <span className={`ml-2 text-xs font-medium ${getPriorityColor(doc.priority)}`}>
                                {doc.priority.toUpperCase()}
                              </span>
                            </div>
                            {doc.tags && doc.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {doc.tags.map((tag, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 capitalize">
                            {doc.category.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                            {doc.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {doc.status === 'pending' ? (
                            <span className="text-sm text-gray-500">Awaiting review</span>
                          ) : doc.reviewedBy ? (
                            <div className="text-sm">
                              <div className="text-gray-900">
                                {doc.status === 'approved' ? 'Approved' : 'Rejected'} by {doc.reviewedBy.name}
                              </div>
                              {doc.reviewDate && (
                                <div className="text-gray-500">
                                  {new Date(doc.reviewDate).toLocaleDateString()}
                                </div>
                              )}
                              {doc.reviewComments && (
                                <div className="text-gray-600 italic mt-1">
                                  "{doc.reviewComments}"
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">No review info</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-sm font-medium text-gray-500">Total Documents</div>
            <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-sm font-medium text-gray-500">Pending Review</div>
            <div className="text-2xl font-bold text-yellow-600">
              {documents.filter(doc => doc.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-sm font-medium text-gray-500">Approved</div>
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(doc => doc.status === 'approved').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-sm font-medium text-gray-500">Rejected</div>
            <div className="text-2xl font-bold text-red-600">
              {documents.filter(doc => doc.status === 'rejected').length}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
