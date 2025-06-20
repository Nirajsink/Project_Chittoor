'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          School Learning Management System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Empowering education through technology
        </p>
        
        <Link 
          href="/login" 
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Login to Continue
        </Link>
      </div>
    </div>
  )
}
