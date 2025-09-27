'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { FileText, Shield, Users } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/auth/login')
      }
    }
  }, [user, loading, router])

  // Show loading screen while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <div className="flex items-center space-x-1">
            <FileText className="w-8 h-8 text-white" />
            <div className="w-1 h-8 bg-white/30 rounded-full"></div>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          DocFlow Pro
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Professional Document Management System
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Streamline your document workflows with enterprise-grade security
        </p>

        {/* Loading indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading...</span>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-md mx-auto">
          <div className="text-center p-4 bg-white/50 rounded-lg">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">Document Upload</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-lg">
            <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-gray-600">Secure Approval</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-lg">
            <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-sm text-gray-600">Team Management</p>
          </div>
        </div>
      </div>
    </div>
  )
}