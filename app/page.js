'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { BookOpen, Users, Award, ArrowRight, Sparkles } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: BookOpen,
      title: "Interactive Learning",
      description: "Engage with dynamic content and multimedia resources"
    },
    {
      icon: Users,
      title: "Collaborative Platform",
      description: "Connect with peers and teachers in real-time"
    },
    {
      icon: Award,
      title: "Achievement Tracking",
      description: "Monitor progress and celebrate milestones"
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  return (
    <>
      <style jsx global>{`
        .btn-gradient-border {
          border: 2px solid #60a5fa; /* blue-400 */
          border-radius: 9999px;
          background: white;
          transition:
            border-color 0.3s cubic-bezier(.4,0,.2,1),
            box-shadow 0.3s cubic-bezier(.4,0,.2,1);
        }
        .btn-gradient-border:hover, .btn-gradient-border:focus-visible {
          border-image: linear-gradient(90deg,#60a5fa,#a78bfa,#f472b6,#60a5fa) 1;
          border-color: transparent;
          box-shadow: 0 2px 16px 0 #a78bfa22;
        }
      `}</style>

      <div className="min-h-screen bg-secondary relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <motion.div
            className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute top-32 right-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Header */}
        <motion.header
          className="relative z-20 p-4 sm:p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Image src="/logo-only.svg" alt="Platform Logo" width={32} height={32} />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                XCELERATOR
              </h1>
            </div>
            <ModeToggle />
          </div>
        </motion.header>

        {/* Main Content */}
        <motion.main
          className="relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <section className="px-4 sm:px-6 py-16 md:py-24">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              
              {/* Left Column: Messaging & CTA */}
              <motion.div className="text-center md:text-left" variants={itemVariants}>
                <motion.h2 
                  className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                >
                  The Future of Education, Today.
                </motion.h2>
                <p className="text-lg lg:text-xl text-secondary mb-8 leading-relaxed">
                  Welcome to the <strong>School Learning Platform</strong>, home of the transformative <strong>Project Chittoor</strong> initiative. Empowering students and teachers through technology.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="btn-gradient-border px-8 py-4 text-lg font-semibold group flex items-center gap-2 w-full sm:w-auto justify-center bg-white dark:bg-background"
                >
                  <Link href="/login" tabIndex={0}>
                    <span className="relative z-10 text-blue-700 dark:text-blue-200 group-hover:text-purple-700 transition-colors">
                      Login to Continue
                    </span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>

              {/* Right Column: Visual Showcase Card */}
              <motion.div variants={itemVariants}>
                <div className="relative group overflow-hidden rounded-3xl shadow-2xl glass-card">
                  <Image
                    src="/ProjChittoor.jpeg"
                    alt="Project Chittoor Initiative"
                    width={600}
                    height={450}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-4">Project Chittoor Impact</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="font-bold text-2xl text-blue-400">50+</p>
                        <p className="text-sm opacity-90">Schools</p>
                      </div>
                      <div>
                        <p className="font-bold text-2xl text-blue-400">5,000+</p>
                        <p className="text-sm opacity-90">Students</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Features Section (no black line in between) */}
          <section className="px-4 sm:px-6 py-16 md:py-24">
            <motion.div className="text-center mb-12" variants={itemVariants}>
              <Sparkles className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h2 className="text-3xl lg:text-4xl font-bold text-primary">Core Platform Features</h2>
              <p className="text-lg text-secondary mt-2">Everything you need for a modern learning experience.</p>
            </motion.div>
            
            <motion.div 
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
              variants={itemVariants}
            >
              {features.map((feature) => (
                <div key={feature.title} className="card text-center group p-6">
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2 text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </motion.div>
          </section>
        </motion.main>
      </div>
    </>
  )
}
