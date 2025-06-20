'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [formData, setFormData] = useState({ rollNumber: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        console.log('Login successful, user role:', data.user.role)
        console.log('Redirecting to:', `/${data.user.role}-dashboard`)
        
        // Multiple redirect strategies for better reliability
        try {
          // Method 1: Next.js router push
          await router.push(`/${data.user.role}-dashboard`)
          
          // Method 2: Fallback with window.location (after a small delay)
          setTimeout(() => {
            if (window.location.pathname === '/login') {
              console.log('Router push failed, using window.location')
              window.location.href = `/${data.user.role}-dashboard`
            }
          }, 500)
          
        } catch (routerError) {
          console.error('Router push failed:', routerError)
          // Method 3: Direct window.location as backup
          window.location.href = `/${data.user.role}-dashboard`
        }
        
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }
  
  const quickLogin = async (rollNumber, password) => {
    setFormData({ rollNumber, password })
    
    // Auto-submit after setting form data
    setTimeout(async () => {
      setLoading(true)
      setError('')
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rollNumber, password })
        })
        
        const data = await response.json()
        
        if (response.ok) {
          console.log('Quick login successful, redirecting to:', `/${data.user.role}-dashboard`)
          
          // Force redirect for quick login
          window.location.href = `/${data.user.role}-dashboard`
          
        } else {
          setError(data.error)
        }
      } catch (error) {
        console.error('Quick login error:', error)
        setError('Something went wrong')
      } finally {
        setLoading(false)
      }
    }, 100)
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">School LMS</h2>
          <p className="mt-2 text-gray-600">Sign in with your roll number</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Roll Number
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.rollNumber}
              onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
              placeholder="Enter your roll number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        {/* Quick Login Buttons */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Login (Test Users):</h3>
          <div className="space-y-2">
            <button
              onClick={() => quickLogin('STU001', 'password123')}
              disabled={loading}
              className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50"
            >
              👨‍🎓 Student: STU001 / password123
            </button>
            <button
              onClick={() => quickLogin('TEA001', 'password123')}
              disabled={loading}
              className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 disabled:opacity-50"
            >
              👩‍🏫 Teacher: TEA001 / password123
            </button>
            <button
              onClick={() => quickLogin('ADM001', 'password123')}
              disabled={loading}
              className="w-full text-left px-3 py-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 disabled:opacity-50"
            >
              👨‍💼 Admin: ADM001 / password123
            </button>
          </div>
        </div>
        
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-800">
            ← Back to Home
          </Link>
        </div>
        
        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 mt-2">Signing in...</p>
          </div>
        )}
      </div>
    </div>
  )
}
