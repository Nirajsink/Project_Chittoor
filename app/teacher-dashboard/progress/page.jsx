'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic' // For lazy loading ContentViewer

// Lucide Icons
import { Download, ChevronLeft } from 'lucide-react'

// --- Shared Layout Component ---
import DashboardLayout from '@/components/DashboardLayout' // Import the shared layout
import { Button } from '@/components/ui/button' // Assuming Button is used

// Lazy-load ContentViewer if it's used here (e.g., for viewing student submissions)
const ContentViewer = dynamic(() => import('@/components/ContentViewer'), { ssr: false });

export default function StudentProgressPage() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classInfo, setClassInfo] = useState(null);
  const [viewingContent, setViewingContent] = useState(null); // For ContentViewer modal

  // --- Effects for Data Loading ---
  useEffect(() => {
    fetchUser();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchProgressData(selectedSubject.id);
    }
  }, [selectedSubject]);

  // --- Backend Interaction Functions ---
  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/teacher/subjects');
      const data = await res.json();
      setSubjects(data.subjects || []);
      if (data.subjects?.length > 0) {
        setSelectedSubject(data.subjects[0]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchProgressData = async (subjectId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/student-progress/${subjectId}`);
      const data = await res.json();
      setProgressData(data.progressData || []);
      setClassInfo(data.classInfo || null);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // --- CSV Download Logic ---
  const downloadCSV = () => {
    if (!progressData.length) {
      alert('No data to download');
      return;
    }

    // Create CSV headers
    const headers = [
      'Roll Number',
      'Student Name',
      'Class',
      'Total Content',
      'Content Viewed',
      'Content Progress %',
      'Total Quizzes',
      'Quizzes Attempted',
      'Quiz Progress %',
      'Average Quiz Score %',
      'Overall Progress %'
    ];

    // Create CSV rows
    const csvData = progressData.map(student => [
      student.roll_number,
      student.full_name,
      student.class,
      student.total_content,
      student.content_viewed,
      student.content_progress,
      student.total_quizzes,
      student.quizzes_attempted,
      student.quiz_progress,
      student.avg_quiz_score,
      student.overall_progress
    ]);

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedSubject?.name}_${classInfo?.name}_Progress_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- UI Helper Functions ---
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const handleViewContent = (content) => setViewingContent(content);
  const closeContentViewer = () => setViewingContent(null);

  // Framer Motion variants for consistent animations
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={handleLogout}
      dashboardTitle="Student Progress"
      // No search bar on this page, so don't pass searchQuery/setSearchQuery
    >
      {/* Back to Dashboard Button */}
      <motion.div initial="hidden" animate="visible" variants={itemVariants}>
        <Link href="/teacher-dashboard" passHref>
          <Button variant="outline" className="mb-6 flex items-center gap-2 text-secondary hover:text-primary border-border hover:bg-accent">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>
      </motion.div>

      {/* Subject Selection */}
      <motion.div className="card mb-6" variants={itemVariants}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">Select Subject to View Progress</h2>
          {selectedSubject && progressData.length > 0 && (
            <Button
              onClick={downloadCSV}
              className="btn btn-primary bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download CSV
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjects.map(subject => (
            <motion.button
              key={subject.id}
              onClick={() => setSelectedSubject(subject)}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                selectedSubject?.id === subject.id
                  ? 'border-blue-600 bg-blue-50 text-blue-800'
                  : 'border-border hover:border-blue-300 bg-background text-primary hover:bg-accent'
              }`}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <h3 className="font-semibold">{subject.name}</h3>
              <p className="text-sm text-secondary">{subject.class_name}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Progress Data Table */}
      {selectedSubject && (
        <motion.div className="card" variants={itemVariants}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-primary">{selectedSubject.name} - Student Progress</h2>
              {classInfo && (
                <p className="text-secondary">Class: {classInfo.name} | Total Students: {progressData.length}</p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-primary">Loading student progress...</p>
            </div>
          ) : progressData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-accent">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                      Roll Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                      Content Progress
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                      Quiz Progress
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                      Avg Quiz Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                      Overall Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-primary divide-y divide-border">
                  {progressData.map((student, index) => (
                    <tr key={student.roll_number} className={index % 2 === 0 ? 'bg-primary' : 'bg-secondary'}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-primary">
                        {student.roll_number}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                        {student.full_name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-secondary">{student.content_viewed}/{student.total_content}</span>
                              <span className={`px-2 py-1 rounded ${getProgressColor(student.content_progress)}`}>
                                {student.content_progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${student.content_progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-secondary">{student.quizzes_attempted}/{student.total_quizzes}</span>
                              <span className={`px-2 py-1 rounded ${getProgressColor(student.quiz_progress)}`}>
                                {student.quiz_progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${student.quiz_progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProgressColor(student.avg_quiz_score)}`}>
                          {student.avg_quiz_score}%
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProgressColor(student.overall_progress)}`}>
                          {student.overall_progress}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-secondary">
              <p>No progress data available for this subject.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ContentViewer Modal (if used for viewing student submissions or details) */}
      {viewingContent && (
        <ContentViewer content={viewingContent} onClose={closeContentViewer} />
      )}
    </DashboardLayout>
  );
}
