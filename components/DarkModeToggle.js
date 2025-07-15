'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'

export default function DarkModeToggle() {
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
    <motion.button
      onClick={toggleDarkMode}
      className="p-3 rounded-full glass hover:scale-110 transition-all duration-300"
      whileHover={{ rotate: 180 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle dark mode"
    >
      {darkMode ? 
        <Sun className="w-5 h-5 text-yellow-500" /> : 
        <Moon className="w-5 h-5 text-blue-600" />
      }
    </motion.button>
  )
}
