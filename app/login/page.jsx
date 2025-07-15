'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun, Moon, Eye, EyeOff, GraduationCap, User, Lock, ArrowRight, Sparkles, Mail, KeyRound
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [formData, setFormData] = useState({ rollNumber: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState('')
  const [mounted, setMounted] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setMounted(true)
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

    if (!formData.rollNumber.trim()) {
      setError('Please enter your roll number or email')
      setLoading(false)
      return
    }
    if (!formData.password.trim()) {
      setError('Please enter your password')
      setLoading(false)
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (response.ok) {
        router.push(`/${data.user.role}-dashboard`)
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
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
          window.location.href = `/${data.user.role}-dashboard`
        } else {
          setError(data.error)
        }
      } catch (error) {
        console.error('Quick login error:', error)
        setError('Something went wrong during quick login.')
      } finally {
        setLoading(false)
      }
    }, 100)
  }

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  const floatingVariants = {
    initial: { y: 0, rotate: 0 },
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-secondary relative overflow-hidden flex flex-col">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{ scale: [1, 1.3, 1], x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{ scale: [1.3, 1, 1.3], x: [0, -50, 0], y: [0, -100, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-15"
          animate={{ scale: [1, 1.2, 1], x: [-50, 50, -50], y: [-30, 30, -30] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating Icons */}
      <motion.div className="absolute top-32 right-32 text-4xl opacity-20" variants={floatingVariants} initial="initial" animate="animate">📚</motion.div>
      <motion.div className="absolute bottom-32 left-32 text-3xl opacity-20" variants={floatingVariants} initial="initial" animate="animate" transition={{ delay: 1 }}>🎓</motion.div>
      <motion.div className="absolute top-1/2 right-20 text-2xl opacity-20" variants={floatingVariants} initial="initial" animate="animate" transition={{ delay: 2 }}>💡</motion.div>

      {/* Header */}
      <motion.header
        className="relative z-10 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/">
            <motion.div className="flex items-center gap-3 group" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}>
              <motion.div className="relative" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                <GraduationCap className="w-8 h-8 text-blue-600" />
                <motion.div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full" animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              </motion.div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">XCELERATOR</h1>
            </motion.div>
          </Link>

          {/* Dark Mode Toggle */}
          <motion.button
            onClick={toggleDarkMode}
            className="p-3 rounded-full glass hover:scale-110 transition-all duration-300 group"
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle dark mode"
          >
            <AnimatePresence mode="wait">
              {darkMode ? (
                <motion.div key="sun" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
                  <Sun className="w-5 h-5 text-yellow-500" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.2 }}>
                  <Moon className="w-5 h-5 text-blue-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.div
        className="relative z-10 flex items-center justify-center flex-grow px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="w-full max-w-md" variants={itemVariants}>
          {/* Welcome Message */}
          <motion.div className="text-center mb-10" variants={itemVariants}>
            <motion.div className="inline-flex items-center gap-2 px-5 py-3 rounded-full glass mb-6" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}>
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="text-base font-medium text-secondary">Welcome to the Future of Learning</span>
            </motion.div>

            <motion.h2
              className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4 leading-tight"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              Welcome to XCELERATOR
            </motion.h2>
            <p className="text-secondary text-lg max-w-md mx-auto leading-relaxed">Accelerate your learning journey with next-generation education</p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            className="card glass backdrop-blur-lg border-2 border-opacity-20 p-8 rounded-2xl shadow-lg"
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div className="text-center mb-10" variants={itemVariants}>
              <motion.div
                className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg mx-auto"
                animate={{ rotateY: [0, 360], scale: [1, 1.1, 1] }}
                transition={{ rotateY: { duration: 4, repeat: Infinity, ease: "easeInOut" }, scale: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
              >
                <User className="w-12 h-12" />
              </motion.div>

              <h3 className="text-3xl font-bold text-primary mb-3">Sign In</h3>
              <p className="text-secondary text-lg max-w-xs mx-auto leading-relaxed">Enter your credentials to access your account</p>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="text-red-500 text-sm text-center p-5 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 mb-6"
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div animate={{ x: [0, -5, 5, -5, 5, 0] }} transition={{ duration: 0.5 }}>
                    {error}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Roll Number Field */}
              <motion.div variants={itemVariants} className="relative">
                <Label htmlFor="rollNumber" className="block text-sm font-semibold text-primary mb-4">
                  Roll Number / Email Address
                </Label>
                <div className="relative group">
                  <motion.div
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === 'rollNumber' ? 'text-blue-600' : 'text-muted'
                    }`}
                    animate={{ scale: focusedField === 'rollNumber' ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {formData.rollNumber.includes('@') ? <Mail className="w-6 h-6" /> : <User className="w-6 h-6" />}
                  </motion.div>
                  <Input
                    id="rollNumber"
                    type="text"
                    name="rollNumber"
                    required
                    value={formData.rollNumber}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('rollNumber')}
                    onBlur={() => setFocusedField('')}
                    className="input pl-14 pr-4 group-hover:border-blue-400 transition-all duration-200 rounded-lg py-3 text-lg"
                    placeholder="Enter your roll number or email"
                    autoComplete="username"
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: focusedField === 'rollNumber' ? '100%' : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants} className="relative">
                <Label htmlFor="password" className="block text-sm font-semibold text-primary mb-4">
                  Password
                </Label>
                <div className="relative group">
                  <motion.div
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === 'password' ? 'text-blue-600' : 'text-muted'
                    }`}
                    animate={{ scale: focusedField === 'password' ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <KeyRound className="w-6 h-6" />
                  </motion.div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    className="input pl-14 pr-14 group-hover:border-blue-400 transition-all duration-200 rounded-lg py-3 text-lg"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted hover:text-primary transition-colors p-2 rounded"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <AnimatePresence mode="wait">
                      {showPassword ? (
                        <motion.div
                          key="hide"
                          initial={{ opacity: 0, rotate: -90 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <EyeOff className="w-6 h-6" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="show"
                          initial={{ opacity: 0, rotate: 90 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: -90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Eye className="w-6 h-6" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: focusedField === 'password' ? '100%' : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary group relative overflow-hidden rounded-lg py-3 text-lg font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    boxShadow: loading ? "0 0 20px rgba(59, 130, 246, 0.5)" : "0 4px 15px rgba(59, 130, 246, 0.2)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="relative flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <motion.div
                          className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <motion.div className="group-hover:translate-x-1 transition-transform" whileHover={{ x: 4 }}>
                          <ArrowRight className="w-6 h-6" />
                        </motion.div>
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            </form>

            {/* Quick Login Buttons */}
            <motion.div variants={itemVariants} className="border-t pt-8 mt-8 border-border">
              <h3 className="text-sm font-medium text-primary mb-4">Quick Login (Test Users):</h3>
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-primary border-border hover:bg-accent rounded-lg py-3 text-base"
                  disabled={loading}
                  onClick={() => quickLogin('STU010', 'password123')}
                >
                  👨‍🎓 Student: STU010 / password123
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-primary border-border hover:bg-accent rounded-lg py-3 text-base"
                  disabled={loading}
                  onClick={() => quickLogin('TEA001', 'password123')}
                >
                  👩‍🏫 Teacher: TEA001 / password123
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-primary border-border hover:bg-accent rounded-lg py-3 text-base"
                  disabled={loading}
                  onClick={() => quickLogin('ADM001', 'password123')}
                >
                  👨‍💼 Admin: ADM001 / password123
                </Button>
              </div>
            </motion.div>
          </motion.div>

          {/* Back to Home */}
          <motion.div className="text-center mt-10" variants={itemVariants}>
            <Link href="/">
              <motion.span
                className="text-secondary hover:text-primary transition-colors font-medium group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.span className="inline-block group-hover:-translate-x-1 transition-transform">←{" "}</motion.span>
                Back to Home
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
