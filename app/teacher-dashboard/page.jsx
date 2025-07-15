'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic' // For lazy loading
import Link from 'next/link'
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

// Lucide Icons directly used in this main component (Header, Welcome, Logout)
import { Sun, Moon, Bell, Search, LogOut, Plus, BarChart3 } from 'lucide-react'

// --- Shared Layout Component ---
import DashboardLayout from '@/components/DashboardLayout' // Import the shared layout

// --- Lazy-loaded Components ---
// Disable SSR for these components as they might rely on browser APIs or are large
const ContentViewer = dynamic(() => import('@/components/ContentViewer'), { ssr: false });

// Lazy-load the new section components for the teacher dashboard
const TeacherStatsCards = dynamic(() => import('@/components/dashboard/teacher/TeacherStatsCards'), { ssr: false });
const TeacherClassesSection = dynamic(() => import('@/components/dashboard/teacher/TeacherClassesSection'), { ssr: false });
const TeacherPerformanceAnalytics = dynamic(() => import('@/components/dashboard/teacher/TeacherPerformanceAnalytics'), { ssr: false });
const TeacherQuickActions = dynamic(() => import('@/components/dashboard/teacher/TeacherQuickActions'), { ssr: false });
const TeacherRecentActivities = dynamic(() => import('@/components/dashboard/teacher/TeacherRecentActivities'), { ssr: false });
const TeacherUpcomingTasks = dynamic(() => import('@/components/dashboard/teacher/TeacherUpcomingTasks'), { ssr: false });

// Lazy-load Modals - Removed explicit .jsx extension to allow Next.js resolver to find them
const UploadMaterialModal = dynamic(() => import('@/components/dashboard/teacher/UploadMaterialModal'), { ssr: false });
const CreateQuizModal = dynamic(() => import('@/components/dashboard/teacher/CreateQuizModal'), { ssr: false });

export default function TeacherDashboard() {
  const router = useRouter(); // Initialize router

  // --- User and authentication state ---
  const [user, setUser] = useState(null);

  // --- Subject and content data ---
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [materials, setMaterials] = useState({
    textbook: [],
    ppt: [],
    quiz: []
  });

  // --- New: State for Dashboard Summary and Recent Activities from backend ---
  const [dashboardSummary, setDashboardSummary] = useState({
    totalStudents: 'N/A',
    activeClasses: 'N/A', // This will be updated by loadSubjects
    avgPerformance: 'N/A',
    teachingHours: 'N/A',
  });
  const [recentActivitiesData, setRecentActivitiesData] = useState([]);
  const [upcomingTasksData, setUpcomingTasksData] = useState([]);

  // --- UI state ---
  const [showUpload, setShowUpload] = useState(false);
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const [activeSection, setActiveSection] = useState('textbook'); // For content type tabs within selected subject
  const [uploading, setUploading] = useState(false); // For upload/quiz creation loading state
  const [viewingContent, setViewingContent] = useState(null); // For ContentViewer modal

  // --- DashboardLayout controlled states ---
  const [searchQuery, setSearchQuery] = useState(''); // Managed by DashboardLayout now

  // --- Upload form state ---
  const [uploadForm, setUploadForm] = useState({
    title: '',
    file: null,
    chapterId: '',
    type: 'textbook'
  });

  // --- Quiz creation form state ---
  const [quizForm, setQuizForm] = useState({
    title: '',
    chapterId: '',
    timeLimit: 30,
    questions: [
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        marks: 1
      }
    ]
  });

  // --- Effects for Data Loading and Theme Initialization ---
  useEffect(() => {
    loadCurrentUser();
    loadSubjects(); // Load subjects on initial mount
    fetchDashboardSummary(); // Fetch summary data
    fetchRecentActivities(); // Fetch recent activities
    fetchUpcomingTasks(); // Fetch upcoming tasks
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadChapters(selectedSubject.id);
      loadMaterials(selectedSubject.id);
    }
  }, [selectedSubject]); // Re-load chapters/materials when selectedSubject changes

  // --- Backend Interaction Functions ---
  const loadCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Failed to load user:', error);
      // Handle error, e.g., redirect to login
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await fetch('/api/teacher/subjects');
      const data = await response.json();
      setSubjects(data.subjects || []);
      // Update activeClasses in dashboardSummary based on fetched subjects
      setDashboardSummary(prev => ({ ...prev, activeClasses: (data.subjects?.length || 0).toString() }));

      if (data.subjects?.length > 0) {
        setSelectedSubject(data.subjects[0]); // Auto-select the first subject
      }
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  // New: Fetch Dashboard Summary
  const fetchDashboardSummary = async () => {
    try {
      // ASSUMPTION: Your backend has an API like /api/teacher/dashboard-summary
      const response = await fetch('/api/teacher/dashboard-summary');
      const data = await response.json();
      setDashboardSummary(prev => ({
        ...prev,
        totalStudents: data.totalStudents || 'N/A',
        avgPerformance: data.avgPerformance || 'N/A',
        teachingHours: data.teachingHours || 'N/A',
        // activeClasses is updated by loadSubjects
      }));
    } catch (error) {
      console.error('Failed to load dashboard summary:', error);
    }
  };

  // New: Fetch Recent Activities
  const fetchRecentActivities = async () => {
    try {
      // ASSUMPTION: Your backend has an API like /api/teacher/recent-activities
      const response = await fetch('/api/teacher/recent-activities');
      const data = await response.json();
      setRecentActivitiesData(data.activities || []);
    } catch (error) {
      console.error('Failed to load recent activities:', error);
    }
  };

  // New: Fetch Upcoming Tasks (if from backend)
  const fetchUpcomingTasks = async () => {
    try {
      // ASSUMPTION: Your backend has an API like /api/teacher/upcoming-tasks
      const response = await fetch('/api/teacher/upcoming-tasks');
      const data = await response.json();
      setUpcomingTasksData(data.tasks || []);
    } catch (error) {
      console.error('Failed to load upcoming tasks:', error);
    }
  };


  const loadChapters = async (subjectId) => {
    try {
      const response = await fetch(`/api/teacher/chapters/${subjectId}`);
      const data = await response.json();
      setChapters(data.chapters || []);
    } catch (error) {
      console.error('Failed to load chapters:', error);
    }
  };

  const loadMaterials = async (subjectId) => {
    try {
      const materialsResponse = await fetch(`/api/teacher/materials/${subjectId}`);
      const materialsData = await materialsResponse.json();
      const allMaterials = materialsData.materials || [];

      const quizResponse = await fetch(`/api/teacher/quizzes/${subjectId}`);
      const quizData = await quizResponse.json();
      const quizzes = quizData.quizzes || [];

      setMaterials({
        textbook: allMaterials.filter(m => m.type === 'textbook' || m.type === 'pdf'),
        ppt: allMaterials.filter(m => m.type === 'ppt' || m.type === 'presentation'),
        quiz: quizzes
      });
    } catch (error) {
      console.error('Failed to load materials:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title || !uploadForm.chapterId) {
      alert('Please fill all fields and select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('title', uploadForm.title);
    formData.append('chapterId', uploadForm.chapterId);
    formData.append('type', uploadForm.type);

    try {
      const response = await fetch('/api/teacher/upload-material', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (response.ok) {
        alert('Material uploaded successfully!');
        setUploadForm({ title: '', file: null, chapterId: '', type: 'textbook' });
        setShowUpload(false);
        loadMaterials(selectedSubject.id); // Reload materials for the current subject
        if (document.querySelector('input[type="file"]')) {
          document.querySelector('input[type="file"]').value = '';
        }
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      alert('Upload error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();

    if (!quizForm.title || !quizForm.chapterId) {
      alert('Please fill in quiz title and select a chapter');
      return;
    }

    const isValid = quizForm.questions.every(q =>
      q.questionText.trim() &&
      q.options.every(opt => opt.trim()) &&
      q.correctAnswer >= 0 && q.correctAnswer < 4
    );

    if (!isValid) {
      alert('Please fill in all questions and options');
      return;
    }

    setUploading(true);

    try {
      const response = await fetch('/api/teacher/create-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizForm.title,
          chapterId: quizForm.chapterId,
          timeLimit: quizForm.timeLimit,
          questions: quizForm.questions
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Quiz created successfully!');
        setQuizForm({
          title: '',
          chapterId: '',
          timeLimit: 30,
          questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }]
        });
        setShowQuizCreator(false);
        loadMaterials(selectedSubject.id);
      } else {
        alert(data.error || 'Failed to create quiz');
      }
    } catch (error) {
      alert('Error creating quiz: ' + error.message);
    } finally {
      setUploading(false);
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

  // --- UI Interaction Handlers (for modals and content) ---
  const handleViewContent = (material) => {
    setViewingContent({
      content_title: material.title,
      content_type: material.type,
      file_url: material.file_url,
      id: material.id
    });
  };

  const closeContentViewer = () => {
    setViewingContent(null);
  };

  // Function to navigate to Student Progress Page
  const handleViewAnalytics = () => {
    router.push('/teacher-dashboard/progress');
  };

  // Quiz form management functions (passed to CreateQuizModal)
  const addQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        marks: 1
      }]
    });
  };

  const removeQuestion = (index) => {
    if (quizForm.questions.length > 1) {
      setQuizForm({
        ...quizForm,
        questions: quizForm.questions.filter((_, i) => i !== index)
      });
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...quizForm.questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuizForm({ ...quizForm, questions: updated });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updated = [...quizForm.questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuizForm({ ...quizForm, questions: updated });
  };

  // --- Framer Motion Variants for Animations ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

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
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      dashboardTitle="Teacher Dashboard"
    >
      {/* Welcome Section */}
      <motion.div
        className="mb-8"
        variants={itemVariants}
      >
        <h2 className="text-3xl font-bold text-primary mb-2">
          Welcome to XCELERATOR, {user?.fullName?.split(' ')[1] || 'Teacher'}! 🚀
        </h2>
        <p className="text-secondary">
          Empower your students with next-generation teaching tools. Here's your teaching command center.
        </p>
      </motion.div>

      {/* Stats Cards Component - Now receives dashboardSummary */}
      <TeacherStatsCards
        totalStudents={dashboardSummary.totalStudents}
        activeClasses={dashboardSummary.activeClasses}
        avgPerformance={dashboardSummary.avgPerformance}
        teachingHours={dashboardSummary.teachingHours}
        itemVariants={itemVariants}
      />

      {/* Main Content Grid (Classes, Performance, Quick Actions, Recent Activities, Upcoming Tasks) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: My Classes & Student Performance Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Classes Section Component */}
          <TeacherClassesSection
            subjects={subjects} // Using 'subjects' from backend as 'classes' in UI
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            chapters={chapters}
            materials={materials}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            handleViewContent={handleViewContent}
            setShowUpload={setShowUpload}
            setShowQuizCreator={setShowQuizCreator}
            itemVariants={itemVariants}
          />

          {/* Student Progress Button within the main content grid */}
          <motion.div variants={itemVariants} className="card p-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-primary">Student Progress Tracking</h3>
            <Link href="/teacher-dashboard/progress" passHref>
              <motion.button
                className="flex items-center gap-2 btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 className="w-4 h-4" />
                View Progress
              </motion.button>
            </Link>
          </motion.div>

          {/* Student Performance Analytics Section Component */}
          <TeacherPerformanceAnalytics
            // studentPerformanceData is mocked at the top, but could be fetched from backend
            studentPerformance={null} // Pass null or fetched data
            itemVariants={itemVariants}
          />
        </div>

        {/* Right Column: Quick Actions, Recent Activities, Upcoming Tasks */}
        <div className="space-y-6">
          {/* Quick Actions Section Component */}
          <TeacherQuickActions
            setShowUpload={setShowUpload}
            setShowQuizCreator={setShowQuizCreator}
            handleViewAnalytics={handleViewAnalytics} // Pass the new handler
            itemVariants={itemVariants}
          />

          {/* Recent Activities Section Component - Now receives actual data */}
          <TeacherRecentActivities
            recentActivities={recentActivitiesData}
            itemVariants={itemVariants}
          />

          {/* Upcoming Tasks Section Component - Now receives actual data */}
          <TeacherUpcomingTasks
            upcomingTasks={upcomingTasksData}
            itemVariants={itemVariants}
          />
        </div>
      </div>

      {/* --- Modals --- */}
      {viewingContent && (
        <ContentViewer content={viewingContent} onClose={closeContentViewer} />
      )}

      {showUpload && (
        <UploadMaterialModal
          showUpload={showUpload}
          setShowUpload={setShowUpload}
          uploadForm={uploadForm}
          setUploadForm={setUploadForm}
          handleUpload={handleUpload}
          uploading={uploading}
          chapters={chapters}
        />
      )}

      {showQuizCreator && (
        <CreateQuizModal
          showQuizCreator={showQuizCreator}
          setShowQuizCreator={setShowQuizCreator}
          quizForm={quizForm}
          setQuizForm={setQuizForm}
          handleCreateQuiz={handleCreateQuiz}
          uploading={uploading}
          chapters={chapters}
          addQuestion={addQuestion}
          removeQuestion={removeQuestion}
          updateQuestion={updateQuestion}
          updateOption={updateOption}
        />
      )}
    </DashboardLayout>
  );
}
