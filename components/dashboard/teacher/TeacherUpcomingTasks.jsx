import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Edit } from 'lucide-react'; // Import icons
import { Button } from "@/components/ui/button"; // Assuming Button is used

// Helper for priority classes
const getPriorityClasses = (priority) => {
  const classes = {
    High: { bg: 'bg-red-100', text: 'text-red-600' },
    Medium: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    Low: { bg: 'bg-green-100', text: 'text-green-600' },
  };
  return classes[priority] || { bg: 'bg-gray-100', text: 'text-gray-600' };
};

export default function TeacherUpcomingTasks({ upcomingTasks, itemVariants }) {
  return (
    <motion.div
      className="card"
      variants={itemVariants}
    >
      <h3 className="text-xl font-bold text-primary mb-6">Upcoming Tasks</h3>

      <div className="space-y-4">
        {upcomingTasks.length > 0 ? (
          upcomingTasks.map((task, index) => {
            const { bg, text } = getPriorityClasses(task.priority);
            return (
              <motion.div
                key={index}
                className="p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
                // Add onClick handler if tasks are clickable (e.g., edit task)
                // onClick={() => alert(`Edit task: ${task.title}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-primary text-sm">{task.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-secondary">
                  <span>{task.class}</span>
                  <span><Calendar className="inline-block w-3 h-3 mr-1" />{task.dueDate}</span>
                </div>
                {/* Optional: Add an edit button or action */}
                {/* <Button variant="ghost" size="sm" className="ml-auto">
                    <Edit className="w-4 h-4 text-secondary" />
                </Button> */}
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-4 text-secondary">No upcoming tasks.</div>
        )}
      </div>
    </motion.div>
  );
}
