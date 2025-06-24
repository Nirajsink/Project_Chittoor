'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false)
  
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
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      {/* Dark Mode Toggle */}
      <div className="absolute top-6 right-6">
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
      
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-primary">
          School Learning Management System
        </h1>
        <p className="text-xl mb-8 text-secondary">
          Empowering education through technology
        </p>
        
        <Link 
          href="/login" 
          className="inline-block px-8 py-4 rounded-lg text-lg font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--blue-600)', color: 'white' }}
        >
          Login to Continue
        </Link>
      </div>
    </div>
  )
}
