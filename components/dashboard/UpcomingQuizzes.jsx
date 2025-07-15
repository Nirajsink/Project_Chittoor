import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button"; // Ensure this path is correct
import { Calendar, Play } from 'lucide-react';

// Helper for Tailwind class mapping
const getDifficultyClasses = (difficulty) => {
  const classes = {
    Easy: { bg: 'bg-green-100', text: 'text-green-600' },
    Medium: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    Hard: { bg: 'bg-red-100', text: 'text-red-600' },
  };
  return classes[difficulty] || { bg: 'bg-gray-100', text: 'text-gray-600' };
};

export default function UpcomingQuizzes({ upcomingQuizzes, handleStartQuiz, itemVariants }) {
  return (
    <motion.div
      className="card"
      variants={itemVariants}
    >
      <h3 className="text-xl font-bold text-primary mb-6">Upcoming Quizzes</h3>

      <div className="space-y-4">
        {upcomingQuizzes.length > 0 ? (
          upcomingQuizzes.map((quiz, index) => {
            const { bg, text } = getDifficultyClasses(quiz.difficulty);
            return (
              <motion.div
                key={index}
                className="p-4 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
                onClick={() => handleStartQuiz(quiz.quizData)}
              >
                <h4 className="font-semibold text-primary mb-2">{quiz.title}</h4>
                <div className="flex items-center gap-2 text-sm text-secondary mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>{quiz.date}</span>
                  <span className="ml-auto">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
                      {quiz.difficulty}
                    </span>
                  </span>
                </div>
                <p className="text-sm text-secondary mb-3">{quiz.subject}</p>

                <Button
                  size="sm"
                  variant="default" // Changed to default for a more prominent button
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent parent div click
                    handleStartQuiz(quiz.quizData);
                  }}
                >
                  Take Quiz <Play className="inline-block ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-4 text-secondary">No upcoming quizzes.</div>
        )}
      </div>
    </motion.div>
  );
}
