'use client'
import { useState, useEffect } from 'react'
import ContentViewer from '@/components/ContentViewer'
import QuizPlayer from '@/components/QuizPlayer'

export default function StudentDashboard() {
  // User and authentication state
  const [user, setUser] = useState(null)
  
  // Content and subject data
  const [contentData, setContentData] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [subjectContent, setSubjectContent] = useState({})
  
  // UI state
  const [activeSection, setActiveSection] = useState('textbook')
  const [loading, setLoading] = useState(true)
  const [viewingContent, setViewingContent] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  
  // Quiz state
  const [takingQuiz, setTakingQuiz] = useState(null)
  const [quizResults, setQuizResults] = useState(null)
  
  // Initialize dashboard when component loads
  useEffect(() => {
    loadCurrentUser()
    initializeDarkMode()
  }, [])
  
  // Load content when user is authenticated
  useEffect(() => {
    if (user?.rollNumber) {
      loadStudentContent()
    }
  }, [user])
  
  // Organize content when data is loaded
  useEffect(() => {
    if (contentData.length > 0) {
      organizeContentBySubjects()
    }
  }, [contentData])
  
  // Initialize dark mode from localStorage or system preference
  const initializeDarkMode = () => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark')
      document.documentElement.setAttribute('data-theme', savedTheme)
    } else if (prefersDark) {
      setDarkMode(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newTheme = !darkMode ? 'dark' : 'light'
    setDarkMode(!darkMode)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }
  
  // Get current authenticated user
  const loadCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error('Failed to load user:', error)
    }
  }
  
  // Load all content for the student using the view
  const loadStudentContent = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/student/content-view')
      const data = await response.json()
      setContentData(data.content || [])
    } catch (error) {
      console.error('Failed to load content:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Organize content by subjects and chapters
  const organizeContentBySubjects = () => {
    const subjectMap = {}
    const subjectsList = []
    
    contentData.forEach(item => {
      const subjectName = item.subject_name
      
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = {
          name: subjectName,
          chapters: {}
        }
        subjectsList.push(subjectMap[subjectName])
      }
      
      const chapterName = item.chapter_name
      
      if (!subjectMap[subjectName].chapters[chapterName]) {
        subjectMap[subjectName].chapters[chapterName] = {
          name: chapterName,
          textbook: [],
          ppt: [],
          quiz: []
        }
      }
      
      // Categorize content by type
      if (item.content_type === 'pdf' || item.content_type === 'textbook') {
        subjectMap[subjectName].chapters[chapterName].textbook.push(item)
      } else if (item.content_type === 'ppt' || item.content_type === 'presentation') {
        subjectMap[subjectName].chapters[chapterName].ppt.push(item)
      } else if (item.content_type === 'quiz') {
        subjectMap[subjectName].chapters[chapterName].quiz.push(item)
      }
    })
    
    setSubjects(subjectsList)
    setSubjectContent(subjectMap)
    
    if (subjectsList.length > 0 && !selectedSubject) {
      setSelectedSubject(subjectsList[0])
    }
  }
  
  // Track content analytics when student views content
  const trackContentView = async (content) => {
    try {
      const contentId = content.content_id || content.id || content.chapter_id
      
      if (!contentId) {
        console.warn('No content ID found for analytics tracking:', content)
        return
      }
      
      const response = await fetch('/api/content/analytics/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: contentId,
          timeSpent: 30
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Analytics tracking failed:', errorData)
      }
    } catch (error) {
      console.error('Failed to track content view:', error)
    }
  }
  
  // Handle viewing content in embedded viewer
  const handleViewContent = (content) => {
    setViewingContent(content)
    trackContentView(content)
  }
  
  // Handle starting a quiz
  const handleStartQuiz = (content) => {
    const quizId = content.file_url.split('/').pop()
    setTakingQuiz(quizId)
    trackContentView(content)
  }
  
  // Handle quiz completion
  const handleQuizComplete = (results) => {
    setTakingQuiz(null)
    setQuizResults(results)
  }
  
  // Close quiz results and refresh content
  const closeQuizResults = () => {
    setQuizResults(null)
    loadStudentContent()
  }
  
  // Close the embedded content viewer
  const closeContentViewer = () => {
    setViewingContent(null)
  }
  
  // Get appropriate icon for content type
  const getContentIcon = (type) => {
    switch(type) {
      case 'textbook': return '📚'
      case 'ppt': return '📊'
      case 'quiz': return '🧠'
      default: return '📄'
    }
  }
  
  // Get theme classes for content type
  const getContentThemeClasses = (type) => {
    switch(type) {
      case 'textbook': return 'bg-blue-theme text-blue-theme'
      case 'ppt': return 'bg-green-theme text-green-theme'
      case 'quiz': return 'bg-purple-theme text-purple-theme'
      default: return 'bg-accent text-primary'
    }
  }
  
  // Get file URL for external access
  const getFileUrl = (content) => {
    if (content.file_url && content.file_url.startsWith('http')) {
      return content.file_url
    }
    return content.file_url || '#'
  }
  
  // Handle user logout
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }
  
  // Get chapters for currently selected subject
  const getCurrentSubjectContent = () => {
    if (!selectedSubject || !subjectContent[selectedSubject.name]) {
      return {}
    }
    return subjectContent[selectedSubject.name].chapters
  }
  
  // Count total content for a specific type
  const getTotalContentCount = (type) => {
    const chapters = getCurrentSubjectContent()
    return Object.values(chapters).reduce((total, chapter) => {
      return total + (chapter[type]?.length || 0)
    }, 0)
  }
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-primary">Loading your subjects...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-primary shadow border-color" style={{ borderBottomWidth: '1px' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center tablet-responsive">
          <div>
            <h1 className="text-2xl font-bold text-primary">Student Dashboard</h1>
            <p className="text-secondary">Welcome, {user?.fullName} - Class {user?.class}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="dark-mode-toggle"
              style={{
                backgroundColor: darkMode ? 'var(--blue-600)' : 'var(--gray-300)'
              }}
              aria-label="Toggle dark mode"
            >
              <span
                className="dark-mode-toggle-thumb"
                style={{
                  transform: darkMode ? 'translateX(20px)' : 'translateX(4px)'
                }}
              />
            </button>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 rounded transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: 'var(--red-600)', 
                color: 'white' 
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6 tablet-responsive">
        {/* Subject Selection */}
        <div className="bg-primary rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-primary">My Subjects</h2>
          
          {subjects.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <span className="text-4xl mb-4 block">📚</span>
              <h3 className="text-lg font-medium mb-2">No Subjects Available</h3>
              <p className="text-sm">Your subjects haven't been set up yet. Contact your teacher or admin.</p>
            </div>
          ) : (
            <div className="tablet-grid">
              {subjects.map((subject, index) => {
                const chapterCount = Object.keys(subjectContent[subject.name]?.chapters || {}).length
                const totalContent = Object.values(subjectContent[subject.name]?.chapters || {}).reduce((total, chapter) => {
                  return total + (chapter.textbook?.length || 0) + (chapter.ppt?.length || 0) + (chapter.quiz?.length || 0)
                }, 0)
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedSubject(subject)}
                    className="p-4 rounded-lg border-2 transition-all text-left content-card"
                    style={{
                      borderColor: selectedSubject?.name === subject.name ? 'var(--blue-600)' : 'var(--border-color)',
                      backgroundColor: selectedSubject?.name === subject.name ? 'var(--blue-50)' : 'var(--bg-primary)',
                      boxShadow: selectedSubject?.name === subject.name ? 'var(--shadow)' : 'none'
                    }}
                  >
                    <h3 className="text-lg font-semibold mb-2 text-primary">{subject.name}</h3>
                    <div className="text-sm space-y-1 text-secondary">
                      <p>📖 {chapterCount} chapters</p>
                      <p>📄 {totalContent} materials</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Selected Subject Content */}
        {selectedSubject && (
          <div className="bg-primary rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6 text-primary">
              {selectedSubject.name} - Study Materials
            </h2>
            
            {/* Content Type Tabs */}
            <div className="flex space-x-1 p-1 rounded-lg mb-6 bg-accent">
              {[
                { key: 'textbook', label: 'TextBooks', icon: '📚' },
                { key: 'ppt', label: 'Presentations', icon: '📊' },
                { key: 'quiz', label: 'Quizzes', icon: '🧠' }
              ].map(section => {
                const count = getTotalContentCount(section.key)
                
                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors"
                    style={{
                      backgroundColor: activeSection === section.key ? 'var(--bg-primary)' : 'transparent',
                      color: activeSection === section.key ? 'var(--blue-600)' : 'var(--text-secondary)',
                      fontWeight: activeSection === section.key ? '600' : '400',
                      boxShadow: activeSection === section.key ? 'var(--shadow)' : 'none'
                    }}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="font-medium">{section.label}</span>
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: 'var(--bg-accent)', 
                        color: 'var(--text-secondary)' 
                      }}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
            
            {/* Chapter Content */}
            <div className="space-y-4">
              {Object.entries(getCurrentSubjectContent()).map(([chapterName, chapterData]) => {
                const sectionContent = chapterData[activeSection] || []
                const themeClasses = getContentThemeClasses(activeSection)
                
                return (
                  <div 
                    key={chapterName} 
                    className="border rounded-lg p-4"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary">
                      <span>{getContentIcon(activeSection)}</span>
                      {chapterName}
                      <span className="text-sm ml-2 text-muted">
                        ({sectionContent.length} {activeSection} files)
                      </span>
                    </h3>
                    
                    {sectionContent.length > 0 ? (
                      <div className="tablet-grid">
                        {sectionContent.map((content, index) => (
                          <div 
                            key={index} 
                            className={`border rounded p-3 hover:opacity-90 transition-opacity content-card ${themeClasses.split(' ')[0]}`}
                            style={{ borderColor: themeClasses.includes('blue') ? 'var(--blue-100)' : themeClasses.includes('green') ? 'var(--green-100)' : 'var(--purple-100)' }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getContentIcon(activeSection)}</span>
                                <div>
                                  <h4 className="font-medium text-sm text-primary">
                                    {content.content_title}
                                  </h4>
                                  <p className="text-xs text-secondary">
                                    {content.content_type?.toUpperCase()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {activeSection === 'quiz' ? (
                                  <button
                                    onClick={() => handleStartQuiz(content)}
                                    className="text-sm font-medium px-2 py-1 rounded border transition-colors"
                                    style={{
                                      color: 'var(--purple-600)',
                                      borderColor: 'var(--purple-600)',
                                      backgroundColor: 'transparent'
                                    }}
                                  >
                                    Take Quiz
                                  </button>
                                ) : (
                                  <>
                                    {(activeSection === 'textbook' || activeSection === 'ppt') && (
                                      <button
                                        onClick={() => handleViewContent(content)}
                                        className="text-sm font-medium px-2 py-1 rounded border transition-colors"
                                        style={{
                                          color: activeSection === 'textbook' ? 'var(--blue-600)' : 'var(--green-600)',
                                          borderColor: activeSection === 'textbook' ? 'var(--blue-600)' : 'var(--green-600)',
                                          backgroundColor: 'transparent'
                                        }}
                                      >
                                        View
                                      </button>
                                    )}
                                    <a
                                      href={getFileUrl(content)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => trackContentView(content)}
                                      className="text-sm font-medium transition-colors"
                                      style={{ 
                                        color: activeSection === 'textbook' ? 'var(--blue-600)' : 
                                               activeSection === 'ppt' ? 'var(--green-600)' : 'var(--purple-600)'
                                      }}
                                    >
                                      External
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted">
                        <span className="text-2xl mb-2 block">{getContentIcon(activeSection)}</span>
                        <p className="text-sm">No {activeSection} materials available for this chapter</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
      
      {/* Embedded Content Viewer */}
      {viewingContent && (
        <ContentViewer
          content={viewingContent}
          onClose={closeContentViewer}
        />
      )}
      
      {/* Quiz Player */}
      {takingQuiz && (
        <QuizPlayer
          quizId={takingQuiz}
          onQuizComplete={handleQuizComplete}
          onClose={() => setTakingQuiz(null)}
        />
      )}
      
      {/* Quiz Results Modal */}
      {quizResults && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-primary rounded-lg p-8 max-w-md mx-4 text-center modal-content">
            <div className={`text-6xl mb-4 ${quizResults.passed ? 'text-green-600' : 'text-red-600'}`}>
              {quizResults.passed ? '🎉' : '📚'}
            </div>
            <h3 className="text-2xl font-bold mb-2 text-primary">Quiz Completed!</h3>
            <div className="text-lg mb-4 text-primary">
              Score: {quizResults.score}/{quizResults.totalMarks} ({quizResults.percentage}%)
            </div>
            <p className="mb-6 text-secondary">{quizResults.message}</p>
            <div className="space-y-3">
              <div className="w-full rounded-full h-4" style={{ backgroundColor: 'var(--gray-200)' }}>
                <div 
                  className="h-4 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${quizResults.percentage}%`,
                    backgroundColor: quizResults.passed ? 'var(--green-600)' : 'var(--red-600)'
                  }}
                ></div>
              </div>
              <button
                onClick={closeQuizResults}
                className="px-6 py-2 rounded transition-opacity hover:opacity-90"
                style={{ 
                  backgroundColor: 'var(--blue-600)', 
                  color: 'white' 
                }}
              >
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
