'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sun, Moon, Bell, Search, LogOut } from 'lucide-react'; // Icons for header

export default function DashboardLayout({
  user,
  onLogout,
  searchQuery,
  setSearchQuery,
  dashboardTitle, // Specific title for the current dashboard (e.g., "Student Dashboard", "Teacher Dashboard")
  children
}) {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setDarkMode(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    const newTheme = newDarkMode ? 'dark' : 'light';
    setDarkMode(newDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Framer Motion variants for consistent animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <motion.header
        className="bg-primary border-b border-border sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <motion.h1
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  XCELERATOR
                </motion.h1>
              </Link>
              <div className="hidden md:flex items-center gap-1 text-sm text-secondary">
                <span>{dashboardTitle}</span> {/* Dynamic dashboard title */}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search Input */}
              {setSearchQuery && ( // Only show search if setSearchQuery prop is provided
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10 pr-4 py-2 w-64"
                  />
                </div>
              )}

              {/* Notifications Button (Placeholder) */}
              <motion.button
                className="p-2 rounded-lg hover:bg-accent transition-colors relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="w-5 h-5 text-secondary" />
              </motion.button>

              {/* Dark Mode Toggle Button */}
              <motion.button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                whileHover={{ rotate: 180 }}
                whileTap={{ scale: 0.9 }}
              >
                {darkMode ?
                  <Sun className="w-5 h-5 text-yellow-500" /> :
                  <Moon className="w-5 h-5 text-blue-600" />
                }
              </motion.button>

              {/* User Profile Info */}
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.fullName ? user.fullName[0]?.toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-primary">{user?.fullName || 'Loading User...'}</div>
                  <div className="text-xs text-secondary">{user?.role || 'User'}</div>
                </div>
              </motion.div>

              {/* Logout Button */}
              <motion.button
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-accent transition-colors text-red-500"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <motion.main
        className="max-w-7xl mx-auto px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {children} {/* This is where the specific dashboard content will be rendered */}
      </motion.main>
    </div>
  );
}
