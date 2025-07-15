'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Lucide Icons
import { Sun, Moon, Bell, Search, LogOut, BookOpen, Trophy, Clock, TrendingUp } from 'lucide-react'

// Lazy-loaded Components (disable SSR)
const ContentViewer = dynamic(() => import('@/components/ContentViewer'), { ssr: false });
const QuizPlayer = dynamic(() => import('@/components/QuizPlayer'), { ssr: false });
const StatsCards = dynamic(() => import('@/components/dashboard/StatsCards'), { ssr: false });
const SubjectsSection = dynamic(() => import('@/components/dashboard/SubjectsSection'), { ssr: false });
const RecentActivities = dynamic(() => import('@/components/dashboard/RecentActivities'), { ssr: false });
const UpcomingQuizzes = dynamic(() => import('@/components/dashboard/UpcomingQuizzes'), { ssr: false });
const QuickActions = dynamic(() => import('@/components/dashboard/QuickActions'), { ssr: false });

import { Button } from "@/components/ui/button"

export default function StudentDashboard() {
  // --- Backend-driven State ---
  const [user, setUser] = useState(null);
  const [contentData, setContentData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectContent, setSubjectContent] = useState({});
  const [loading, setLoading] = useState(true);

  // --- UI/Modal Specific State ---
  const [viewingContent, setViewingContent] = useState(null);
  const [takingQuiz, setTakingQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState(null);

  // --- Dashboard State ---
  const [openSubject, setOpenSubject] = useState(null);
  const [activeType, setActiveType] = useState('textbook');

  // --- Theme & Search ---
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Effects for Data Loading and Theme Initialization ---
  useEffect(() => {
    loadCurrentUser();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setDarkMode(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  useEffect(() => {
    if (user?.rollNumber) {
      loadStudentContent();
    }
  }, [user]);

  useEffect(() => {
    if (contentData.length > 0) {
      organizeContentBySubjects();
    }
  }, [contentData]);

  // --- Backend Interaction Functions ---
  const loadCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const loadStudentContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/student/content-view');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setContentData(data.content || []);
    } catch (error) {
      console.error('Failed to load student content:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizeContentBySubjects = () => {
    const subjectMap = {};
    const subjectsList = [];
    contentData.forEach(item => {
      const subjectName = item.subject_name;
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = { name: subjectName, chapters: {} };
        subjectsList.push(subjectMap[subjectName]);
      }
      const chapterName = item.chapter_name;
      if (!subjectMap[subjectName].chapters[chapterName]) {
        subjectMap[subjectName].chapters[chapterName] = {
          name: chapterName, textbook: [], ppt: [], quiz: []
        };
      }
      if (item.content_type === 'pdf' || item.content_type === 'textbook') {
        subjectMap[subjectName].chapters[chapterName].textbook.push(item);
      } else if (item.content_type === 'ppt' || item.content_type === 'presentation') {
        subjectMap[subjectName].chapters[chapterName].ppt.push(item);
      } else if (item.content_type === 'quiz') {
        subjectMap[subjectName].chapters[chapterName].quiz.push(item);
      }
    });
    setSubjects(subjectsList);
    setSubjectContent(subjectMap);
  };

  // --- UI Interaction Handlers ---
  const handleViewContent = (content) => setViewingContent(content);
  const handleStartQuiz = (content) => setTakingQuiz(content.file_url.split('/').pop());
  const handleQuizComplete = (results) => {
    setTakingQuiz(null);
    setQuizResults(results);
  };
  const closeQuizResults = () => {
    setQuizResults(null);
    loadStudentContent();
  };
  const closeContentViewer = () => setViewingContent(null);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    const newTheme = newDarkMode ? 'dark' : 'light';
    setDarkMode(newDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // --- Derived Data for UI Display ---
  const sortedContentData = [...contentData].sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
  const recentActivitiesData = sortedContentData.slice(0, 4).map(item => ({
    type: item.content_type === 'pdf' || item.content_type === 'textbook' ? 'document' : item.content_type,
    title: item.content_title,
    subject: item.subject_name,
    time: new Date(item.uploaded_at).toLocaleDateString(),
    originalContent: item
  }));

  const upcomingQuizzesData = contentData
    .filter(item => item.content_type === 'quiz')
    .slice(0, 3)
    .map(quiz => ({
      title: quiz.content_title,
      subject: quiz.subject_name,
      date: 'N/A',
      difficulty: 'Medium',
      quizData: quiz
    }));

  // Stats Data (placeholders)
  const totalCourses = subjects.length;
  const totalAchievements = 12;
  const totalStudyHours = 47;
  const averageScore = '87%';

  // --- Framer Motion Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* --- Header Section --- */}
      <motion.header
        className="bg-primary border-b border-border sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Logo/Brand */}
          <Link href="/">
            <motion.h1
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              XCELERATOR
            </motion.h1>
          </Link>

          {/* Search input hidden on small screens */}
          <div className="relative flex-grow max-w-xs hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search subjects, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              className="p-2 rounded-lg hover:bg-accent transition-colors w-10 h-10 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-secondary" />
            </motion.button>
            <motion.button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-accent transition-colors w-10 h-10 flex items-center justify-center"
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-blue-600" />
              )}
            </motion.button>
            <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }}>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {user?.name ? user.name[0]?.toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-primary">{user?.name || 'Loading User...'}</div>
                <div className="text-xs text-secondary">Student ID: {user?.rollNumber || 'N/A'}</div>
              </div>
            </motion.div>
            <motion.button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-accent transition-colors text-red-500 w-10 h-10 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* --- Main Content Area --- */}
      <motion.main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
            Welcome to XCELERATOR, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h2>
          <p className="text-sm sm:text-base text-secondary">
            Accelerate your learning journey and unlock your full potential with our advanced educational platform.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <StatsCards
          totalCourses={totalCourses}
          totalAchievements={totalAchievements}
          totalStudyHours={totalStudyHours}
          averageScore={averageScore}
          itemVariants={itemVariants}
          icons={{ BookOpen, Trophy, Clock, TrendingUp }}
        />

        {/* Responsive Grid: 1 column on mobile, 3 on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: spans 2 columns on desktop */}
          <div className="lg:col-span-2 space-y-6">
            <SubjectsSection
              subjects={subjects}
              subjectContent={subjectContent}
              loading={loading}
              handleViewContent={handleViewContent}
              handleStartQuiz={handleStartQuiz}
              itemVariants={itemVariants}
              openSubject={openSubject}
              setOpenSubject={setOpenSubject}
              activeType={activeType}
              setActiveType={setActiveType}
            />
            <RecentActivities
              recentActivities={recentActivitiesData}
              handleViewContent={handleViewContent}
              handleStartQuiz={handleStartQuiz}
              itemVariants={itemVariants}
            />
          </div>
          {/* Right Column */}
          <div className="space-y-6">
            <UpcomingQuizzes
              upcomingQuizzes={upcomingQuizzesData}
              handleStartQuiz={handleStartQuiz}
              itemVariants={itemVariants}
            />
            <QuickActions
              subjects={subjects}
              setOpenSubject={setOpenSubject}
              setActiveType={setActiveType}
              itemVariants={itemVariants}
            />
          </div>
        </div>
      </motion.main>

      {/* --- Modals for Content Viewer and Quiz Player --- */}
      {viewingContent && (
        <ContentViewer content={viewingContent} onClose={closeContentViewer} />
      )}
      {takingQuiz && (
        <QuizPlayer
          quizId={takingQuiz}
          onQuizComplete={handleQuizComplete}
          onClose={() => setTakingQuiz(null)}
        />
      )}
      {quizResults && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-card rounded-lg p-6 sm:p-8 max-w-md w-full mx-auto text-center shadow-xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className={`text-6xl mb-4 ${quizResults.passed ? 'text-green-500' : 'text-blue-600'}`}>
              {quizResults.passed ? '🎉' : '📚'}
            </div>
            <h3 className="text-2xl font-bold mb-2 text-primary">Quiz Completed!</h3>
            <div className="text-lg mb-4 text-secondary">
              Score: {quizResults.score}/{quizResults.totalMarks} ({quizResults.percentage}%)
            </div>
            <p className="mb-6 text-green-700">{quizResults.message}</p>
            <div className="space-y-3">
              <div className="w-full rounded-full h-4 bg-gray-200">
                <motion.div
                  className="h-4 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${quizResults.percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    backgroundColor: quizResults.passed ? '#22c55e' : '#2563eb'
                  }}
                ></motion.div>
              </div>
              <Button
                onClick={closeQuizResults}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                Continue Learning
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}