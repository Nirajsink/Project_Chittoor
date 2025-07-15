import React from 'react';
import { motion } from 'framer-motion';
// Import specific Lucide Icons needed for this component
import { Users, BookOpen, Trophy, Clock } from 'lucide-react';

// Helper function for Tailwind class mapping
const getColorClasses = (color) => {
  const classes = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
  };
  return classes[color] || { bg: 'bg-gray-100', text: 'text-gray-600' }; // Default
};

// Removed 'change' prop as it's not provided by backend APIs yet
export default function TeacherStatsCards({ totalStudents, activeClasses, avgPerformance, teachingHours, itemVariants }) {
  // Use the props directly, no internal mock data
  const stats = [
    { icon: Users, label: 'Total Students', value: totalStudents, color: 'blue' },
    { icon: BookOpen, label: 'Active Classes', value: activeClasses, color: 'green' },
    { icon: Trophy, label: 'Avg. Performance', value: avgPerformance, color: 'yellow' },
    { icon: Clock, label: 'Teaching Hours', value: teachingHours, color: 'purple' },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      variants={itemVariants}
    >
      {stats.map((stat, index) => {
        const { bg, text } = getColorClasses(stat.color);
        const IconComponent = stat.icon; // Icon is now directly the Lucide component

        return (
          <motion.div
            key={index}
            className="card"
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${bg} ${text}`}>
                  {IconComponent && <IconComponent className="w-6 h-6" />}
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-secondary">{stat.label}</div>
                </div>
              </div>
              {/* Removed the 'change' display as it's not dynamic yet */}
              {/* <div className="text-green-600 text-sm font-medium">
                {stat.change}
              </div> */}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
