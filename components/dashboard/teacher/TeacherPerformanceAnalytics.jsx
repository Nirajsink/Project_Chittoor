import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button"; // Ensure this path is correct
import { Download } from 'lucide-react';

// Helper for Tailwind class mapping (for progress bar colors)
const getPerformanceColorClasses = (color) => {
  const classes = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };
  return classes[color] || 'bg-gray-500';
};

export default function TeacherPerformanceAnalytics({ studentPerformance, itemVariants }) {
  // If studentPerformance is null or empty, display a placeholder
  if (!studentPerformance || studentPerformance.length === 0) {
    return (
      <motion.div className="card" variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-primary">Student Performance</h3>
          <Button
            className="btn btn-secondary text-sm"
            onClick={() => alert('Export Report functionality to be implemented!')}
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
        <div className="text-center py-8 text-secondary">
          <p>No student performance data available.</p>
          <p className="text-sm">Ensure students have interacted with content and quizzes.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card"
      variants={itemVariants}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary">Student Performance</h3>
        <Button
          className="btn btn-secondary text-sm"
          onClick={() => alert('Export Report functionality to be implemented!')}
        >
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {studentPerformance.map((performance, index) => {
          const { bg, text } = getPerformanceColorClasses(performance.color); // This is not used now, but kept for consistency
          return (
            <motion.div
              key={index}
              className="p-4 rounded-lg border border-border"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">{performance.name}</span>
                <span className="text-sm text-secondary">{performance.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${getPerformanceColorClasses(performance.color)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${performance.percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </div>
              <div className="text-right text-sm text-secondary mt-1">
                {performance.percentage}%
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
