'use client'

import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/layout/Layout'

export default function AdminPage() {
  const { isAdmin, user } = useAuth()

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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-gray-500 text-sm mt-1">Registered users</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Documents</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-gray-500 text-sm mt-1">Documents uploaded</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Users</h3>
            <p className="text-3xl font-bold text-purple-600">1</p>
            <p className="text-gray-500 text-sm mt-1">System administrators</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a href="/admin/documents" className="block w-full text-left px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                View All Documents
              </a>
              <button className="w-full text-left px-4 py-3 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 transition-colors">
                Document Analytics
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 transition-colors">
                System Settings
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="text-center py-8">
              <p className="text-gray-600">No recent activity to display</p>
              <p className="text-gray-500 text-sm mt-2">User activities will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
