import React from 'react';
import { motion } from 'framer-motion';

// Helper function for Tailwind class mapping
const getColorClasses = (color) => {
  const classes = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  };
  return classes[color] || { bg: 'bg-gray-100', text: 'text-gray-600' }; // Default
};

export default function StatsCards({ totalCourses, totalAchievements, totalStudyHours, averageScore, itemVariants, icons }) {
  const stats = [
    { icon: icons.BookOpen, label: 'Courses', value: totalCourses, color: 'blue' },
    { icon: icons.Trophy, label: 'Achievements', value: totalAchievements, color: 'yellow' },
    { icon: icons.Clock, label: 'Study Hours', value: totalStudyHours + 'h', color: 'green' },
    { icon: icons.TrendingUp, label: 'Average Score', value: averageScore, color: 'purple' },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      variants={itemVariants} // Apply variants to the container
    >
      {stats.map((stat, index) => {
        const { bg, text } = getColorClasses(stat.color);
        return (
          <motion.div
            key={index}
            className="card"
            whileHover={{ y: -4, scale: 1.02 }} // Only apply essential animations
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${bg} ${text}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-secondary">{stat.label}</div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
