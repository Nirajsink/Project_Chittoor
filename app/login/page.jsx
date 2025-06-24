'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [formData, setFormData] = useState({ rollNumber: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const router = useRouter()
  
  // Initialize dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      setDarkMode(false)
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [])
  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    const newTheme = newDarkMode ? 'dark' : 'light'
    
    setDarkMode(newDarkMode)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }
  
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
        
        try {
          await router.push(`/${data.user.role}-dashboard`)
          
          setTimeout(() => {
            if (window.location.pathname === '/login') {
              console.log('Router push failed, using window.location')
              window.location.href = `/${data.user.role}-dashboard`
            }
          }, 500)
          
        } catch (routerError) {
          console.error('Router push failed:', routerError)
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
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="max-w-md w-full mx-4">
        {/* Dark Mode Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleDarkMode}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{
              backgroundColor: darkMode ? '#3b82f6' : '#d1d5db'
            }}
            aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          >
            <span
              className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
              style={{
                transform: darkMode ? 'translateX(24px)' : 'translateX(4px)'
              }}
            />
            <span className="absolute left-1 text-xs">
              {darkMode ? '🌙' : '☀️'}
            </span>
          </button>
        </div>
        
        <div className="bg-primary rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2">School LMS</h2>
            <p className="text-secondary">Sign in with your roll number</p>
          </div>
          
          {error && (
            <div 
              className="p-3 rounded-md mb-4"
              style={{ backgroundColor: 'var(--red-50)', color: 'var(--red-600)' }}
            >
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary">
                Roll Number
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-primary text-primary"
                style={{ borderColor: 'var(--border-color)' }}
                value={formData.rollNumber}
                onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                placeholder="Enter your roll number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary">
                Password
              </label>
              <input
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-primary text-primary"
                style={{ borderColor: 'var(--border-color)' }}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter your password"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--blue-600)' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          {/* Quick Login Buttons */}
          <div className="border-t pt-6 mt-6" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="text-sm font-medium text-primary mb-3">Quick Login (Test Users):</h3>
            <div className="space-y-2">
              <button
                onClick={() => quickLogin('STU010', 'password123')}
                disabled={loading}
                className="w-full text-left px-3 py-2 text-sm rounded transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--blue-50)', color: 'var(--blue-700)' }}
              >
                👨‍🎓 Student: STU010 / password123
              </button>
              <button
                onClick={() => quickLogin('TEA001', 'password123')}
                disabled={loading}
                className="w-full text-left px-3 py-2 text-sm rounded transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--green-50)', color: 'var(--green-700)' }}
              >
                👩‍🏫 Teacher: TEA001 / password123
              </button>
              <button
                onClick={() => quickLogin('ADM001', 'password123')}
                disabled={loading}
                className="w-full text-left px-3 py-2 text-sm rounded transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--red-50)', color: 'var(--red-700)' }}
              >
                👨‍💼 Admin: ADM001 / password123
              </button>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-secondary hover:opacity-80">
              ← Back to Home
            </Link>
          </div>
          
          {loading && (
            <div className="text-center mt-4">
              <div className="loading-spinner h-6 w-6 mx-auto mb-2"></div>
              <p className="text-sm text-secondary">Signing in...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
