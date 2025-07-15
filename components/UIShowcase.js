'use client'
import { motion } from 'framer-motion'
import { CheckCircle, Zap, Star, Heart } from 'lucide-react'

export default function UIShowcase() {
  const improvements = [
    {
      icon: Zap,
      title: "Optimized Cursor",
      description: "Smooth, lag-free custom cursor with hardware acceleration",
      color: "blue"
    },
    {
      icon: Star,
      title: "Enhanced Animations",
      description: "Fluid motion with Framer Motion and spring physics",
      color: "purple"
    },
    {
      icon: Heart,
      title: "Modern Design",
      description: "Beautiful glassmorphism effects and gradient backgrounds",
      color: "pink"
    },
    {
      icon: CheckCircle,
      title: "Responsive Layout",
      description: "Perfectly adapted for all screen sizes and devices",
      color: "green"
    }
  ]

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.2 }}
    >
      {improvements.map((item, index) => (
        <motion.div
          key={index}
          className="card group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <div className="flex items-start gap-4">
            <motion.div
              className={`p-3 rounded-xl bg-${item.color}-100 text-${item.color}-600 group-hover:scale-110 transition-transform`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <item.icon className="w-6 h-6" />
            </motion.div>
            <div>
              <h3 className="font-bold text-primary mb-2">{item.title}</h3>
              <p className="text-secondary text-sm">{item.description}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
