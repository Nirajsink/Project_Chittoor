import React from 'react';
import { motion } from 'framer-motion';
// Import specific Lucide Icons needed for this component
import { Upload, Trophy, Star, Video, FileText } from 'lucide-react';

// Helper for activity icons
const getActivityIcon = (type) => {
  switch (type) {
    case 'upload': return <Upload className="w-4 h-4" />;
    case 'quiz': return <Trophy className="w-4 h-4" />;
    case 'grade': return <Star className="w-4 h-4" />;
    case 'video': return <Video className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

export default function TeacherRecentActivities({ recentActivities, itemVariants }) {
  return (
    <motion.div
      className="card"
      variants={itemVariants}
    >
      <h3 className="text-xl font-bold text-primary mb-6">Recent Activities</h3>

      <div className="space-y-4">
        {recentActivities.length > 0 ? (
          recentActivities.map((activity, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400 }}
              // Add onClick handler if these activities are clickable (e.g., view details)
              // onClick={() => alert(`View details for ${activity.title}`)}
            >
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary">{activity.title}</p>
                <p className="text-xs text-secondary">{activity.class}</p>
                <p className="text-xs text-muted">{activity.time}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-4 text-secondary">No recent activity to display.</div>
        )}
      </div>
    </motion.div>
  );
}
