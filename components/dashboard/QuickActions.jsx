import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, BookOpen, Video, Trophy, Download } from 'lucide-react'; // Import icons

// Helper function for Tailwind class mapping
const getColorClasses = (color) => {
  const classes = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
  };
  return classes[color] || { bg: 'bg-gray-100', text: 'text-gray-600' };
};

// --- IMPORTANT: setOpenSubject, setActiveType are now props ---
export default function QuickActions({ subjects, setOpenSubject, setActiveType, itemVariants }) {
  const actions = [
    {
      icon: BookOpen, label: 'Browse Textbooks', color: 'blue', action: () => {
        if (subjects.length > 0) {
          setOpenSubject(subjects[0].name); // Now uses prop setter
          setActiveType('textbook');       // Now uses prop setter
        } else {
          alert('No subjects available to browse textbooks.');
        }
      }
    },
    {
      icon: Video, label: 'Browse Presentations', color: 'purple', action: () => {
        if (subjects.length > 0) {
          setOpenSubject(subjects[0].name); // Now uses prop setter
          setActiveType('ppt');           // Now uses prop setter
        } else {
          alert('No subjects available to browse presentations.');
        }
      }
    },
    {
      icon: Trophy, label: 'View Quizzes', color: 'yellow', action: () => {
        if (subjects.length > 0) {
          setOpenSubject(subjects[0].name); // Now uses prop setter
          setActiveType('quiz');          // Now uses prop setter
        } else {
          alert('No subjects available to view quizzes.');
        }
      }
    },
    { icon: Download, label: 'Download Materials', color: 'green', action: () => alert('Download functionality to be implemented! (Requires backend download routes)') },
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
