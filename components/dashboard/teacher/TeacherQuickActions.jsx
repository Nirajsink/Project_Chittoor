import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Upload, Trophy, BarChart3, Users } from 'lucide-react'; // Import icons

// Helper function for Tailwind class mapping
const getColorClasses = (color) => {
  const classes = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' }, // Assuming orange for Users
  };
  return classes[color] || { bg: 'bg-gray-100', text: 'text-gray-600' };
};

export default function TeacherQuickActions({ setShowUpload, setShowQuizCreator, handleViewAnalytics, itemVariants }) {
  const actions = [
    { icon: Upload, label: 'Upload Materials', color: 'blue', action: () => setShowUpload(true) },
    { icon: Trophy, label: 'Create Quiz', color: 'purple', action: () => setShowQuizCreator(true) },
    { icon: BarChart3, label: 'View Analytics', color: 'green', action: handleViewAnalytics }, // Use the passed handler
    { icon: Users, label: 'Manage Students', color: 'orange', action: () => alert('Navigate to Student Management Page') },
  ];

  return (
    <motion.div
      className="card"
      variants={itemVariants}
    >
      <h3 className="text-xl font-bold text-primary mb-6">Quick Actions</h3>

      <div className="space-y-3">
        {actions.map((action, index) => {
          const { bg, text } = getColorClasses(action.color);
          return (
            <motion.button
              key={index}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors text-left"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
            >
              <div className={`p-2 rounded-lg ${bg} ${text}`}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="font-medium text-primary">{action.label}</span>
              <ChevronRight className="w-4 h-4 text-secondary ml-auto" />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
