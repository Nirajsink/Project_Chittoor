'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import ContentViewer from '@/components/ContentViewer'

export default function TeacherDashboard() {
  // User and authentication state
  const [user, setUser] = useState(null)
  
  // Subject and content data
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [chapters, setChapters] = useState([])
  const [materials, setMaterials] = useState({
    textbook: [],
    ppt: [],
    quiz: []
  })
  
  // UI state
  const [showUpload, setShowUpload] = useState(false)
  const [showQuizCreator, setShowQuizCreator] = useState(false)
  const [activeSection, setActiveSection] = useState('textbook')
  const [uploading, setUploading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [viewingContent, setViewingContent] = useState(null)
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    file: null,
    chapterId: '',
    type: 'textbook'
  })
  
  // Quiz creation form state
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
  })
  
  // Initialize dark mode
  const initializeDarkMode = () => {
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      setDarkMode(false)
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    const newTheme = newDarkMode ? 'dark' : 'light'
    
    setDarkMode(newDarkMode)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }
  
  // Initialize dashboard when component loads
  useEffect(() => {
    loadCurrentUser()
    loadSubjects()
    initializeDarkMode()
  }, [])
  
  // Load chapters and materials when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      loadChapters(selectedSubject.id)
      loadMaterials(selectedSubject.id)
    }
  }, [selectedSubject])
  
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
  
  // Load teacher's assigned subjects
  const loadSubjects = async () => {
    try {
      const response = await fetch('/api/teacher/subjects')
      const data = await response.json()
      setSubjects(data.subjects || [])
      if (data.subjects?.length > 0) {
        setSelectedSubject(data.subjects[0])
      }
    } catch (error) {
      console.error('Failed to load subjects:', error)
    }
  }
  
  // Load chapters for selected subject
  const loadChapters = async (subjectId) => {
    try {
      const response = await fetch(`/api/teacher/chapters/${subjectId}`)
      const data = await response.json()
      setChapters(data.chapters || [])
    } catch (error) {
      console.error('Failed to load chapters:', error)
    }
  }
  
  // Load materials for selected subject
  const loadMaterials = async (subjectId) => {
    try {
      const response = await fetch(`/api/teacher/materials/${subjectId}`)
      const data = await response.json()
      const allMaterials = data.materials || []
      
      // Get quizzes separately
      const quizResponse = await fetch(`/api/teacher/quizzes/${subjectId}`)
      const quizData = await quizResponse.json()
      const quizzes = quizData.quizzes || []
      
      setMaterials({
        textbook: allMaterials.filter(m => m.type === 'textbook' || m.type === 'pdf'),
        ppt: allMaterials.filter(m => m.type === 'ppt' || m.type === 'presentation'),
        quiz: quizzes
      })
    } catch (error) {
      console.error('Failed to load materials:', error)
    }
  }
  
  // Handle viewing content in embedded viewer
  const handleViewContent = (material) => {
    setViewingContent({
      content_title: material.title,
      content_type: material.type,
      file_url: material.file_url,
      id: material.id
    })
  }
  
  // Close the embedded content viewer
  const closeContentViewer = () => {
    setViewingContent(null)
  }
  
  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadForm.file || !uploadForm.title || !uploadForm.chapterId) {
      alert('Please fill all fields and select a file')
      return
    }
    
    setUploading(true)
    const formData = new FormData()
    formData.append('file', uploadForm.file)
    formData.append('title', uploadForm.title)
    formData.append('chapterId', uploadForm.chapterId)
    formData.append('type', uploadForm.type)
    
    try {
      const response = await fetch('/api/teacher/upload-material', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      
      if (response.ok) {
        alert('Material uploaded successfully!')
        setUploadForm({ title: '', file: null, chapterId: '', type: 'textbook' })
        setShowUpload(false)
        loadMaterials(selectedSubject.id)
        document.querySelector('input[type="file"]').value = ''
      } else {
        alert(data.error || 'Upload failed')
      }
    } catch (error) {
      alert('Upload error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }
  
  // Handle quiz creation
  const handleCreateQuiz = async (e) => {
    e.preventDefault()
    
    // Validate quiz form
    if (!quizForm.title || !quizForm.chapterId) {
      alert('Please fill in quiz title and select a chapter')
      return
    }
    
    const isValid = quizForm.questions.every(q => 
      q.questionText.trim() && 
      q.options.every(opt => opt.trim()) &&
      q.correctAnswer >= 0 && q.correctAnswer < 4
    )
    
    if (!isValid) {
      alert('Please fill in all questions and options')
      return
    }
    
    setUploading(true)
    
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
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('Quiz created successfully!')
        setQuizForm({
          title: '',
          chapterId: '',
          timeLimit: 30,
          questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }]
        })
        setShowQuizCreator(false)
        loadMaterials(selectedSubject.id)
      } else {
        alert(data.error || 'Failed to create quiz')
      }
    } catch (error) {
      alert('Error creating quiz: ' + error.message)
    } finally {
      setUploading(false)
    }
  }
  
  // Quiz form management functions
  const addQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        marks: 1
      }]
    })
  }
  
  const removeQuestion = (index) => {
    if (quizForm.questions.length > 1) {
      setQuizForm({
        ...quizForm,
        questions: quizForm.questions.filter((_, i) => i !== index)
      })
    }
  }
  
  const updateQuestion = (index, field, value) => {
    const updated = [...quizForm.questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuizForm({ ...quizForm, questions: updated })
  }
  
  const updateOption = (questionIndex, optionIndex, value) => {
    const updated = [...quizForm.questions]
    updated[questionIndex].options[optionIndex] = value
    setQuizForm({ ...quizForm, questions: updated })
  }
  
  // Handle user logout
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }
  
  // Get materials by chapter for display
  const getMaterialsByChapter = (chapterId, type) => {
    return materials[type].filter(material => material.chapter_id === chapterId)
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
  
  // Helper functions for content styling
  function getContentBgColor(type) {
    switch(type) {
      case 'textbook': return 'var(--blue-50)'
      case 'ppt': return 'var(--green-50)'
      case 'quiz': return 'var(--purple-50)'
      default: return 'var(--bg-accent)'
    }
  }
  
  function getContentBorderColor(type) {
    switch(type) {
      case 'textbook': return 'var(--blue-100)'
      case 'ppt': return 'var(--green-100)'
      case 'quiz': return 'var(--purple-100)'
      default: return 'var(--border-color)'
    }
  }
  
  function getContentColor(type) {
    switch(type) {
      case 'textbook': return 'var(--blue-600)'
      case 'ppt': return 'var(--green-600)'
      case 'quiz': return 'var(--purple-600)'
      default: return 'var(--text-primary)'
    }
  }
  
  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-primary shadow border-color" style={{ borderBottomWidth: '1px' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center tablet-responsive">
          <div>
            <h1 className="text-2xl font-bold text-primary">Teacher Dashboard</h1>
            <p className="text-secondary">Welcome, {user?.fullName}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{
                backgroundColor: darkMode ? '#3b82f6' : '#d1d5db'
              }}
              aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
                style={{
                  transform: darkMode ? 'translateX(24px)' : 'translateX(4px)'
                }}
              />
              <span className="absolute left-1 text-xs">
                {darkMode ? '🌙' : '☀️'}
              </span>
            </button>
            
            <Link
              href="/teacher-dashboard/progress"
              className="px-4 py-2 rounded transition-opacity hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: 'var(--blue-600)', color: 'white' }}
            >
              <span>📊</span> Student Progress
            </Link>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 rounded transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--red-600)', color: 'white' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6 tablet-responsive">
        {/* Subject Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-primary">My Subjects</h2>
          <div className="tablet-grid">
            {subjects.map(subject => (
              <div
                key={subject.id}
                onClick={() => setSelectedSubject(subject)}
                className="bg-primary rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg content-card"
                style={{
                  border: selectedSubject?.id === subject.id ? '2px solid var(--blue-600)' : '2px solid transparent',
                  backgroundColor: selectedSubject?.id === subject.id ? 'var(--blue-50)' : 'var(--bg-primary)'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-primary">{subject.name}</h3>
                  <span 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--blue-100)', color: 'var(--blue-800)' }}
                  >
                    Class {subject.class_id}
                  </span>
                </div>
                <p className="text-secondary text-sm mb-3">{subject.description}</p>
                <div className="flex items-center text-sm text-muted">
                  <span>📚 Click to manage materials</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Selected Subject Content Management */}
        {selectedSubject && (
          <div className="bg-primary rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">{selectedSubject.name} - Content Management</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowUpload(true)}
                  className="px-4 py-2 rounded transition-opacity hover:opacity-90 flex items-center gap-2"
                  style={{ backgroundColor: 'var(--green-600)', color: 'white' }}
                >
                  <span>📤</span> Upload Material
                </button>
                <button
                  onClick={() => setShowQuizCreator(true)}
                  className="px-4 py-2 rounded transition-opacity hover:opacity-90 flex items-center gap-2"
                  style={{ backgroundColor: 'var(--purple-600)', color: 'white' }}
                >
                  <span>🧠</span> Create Quiz
                </button>
              </div>
            </div>
            
            {/* Content Type Tabs */}
            <div className="flex space-x-1 mb-6 p-1 rounded-lg bg-accent">
              {[
                { key: 'textbook', label: 'TextBooks (PDF)', icon: '📚' },
                { key: 'ppt', label: 'Presentations (PPT)', icon: '📊' },
                { key: 'quiz', label: 'Quizzes', icon: '🧠' }
              ].map(section => (
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
                    style={{ backgroundColor: 'var(--bg-accent)', color: 'var(--text-secondary)' }}
                  >
                    {materials[section.key].length}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Content Display by Chapters */}
            <div className="space-y-6">
              {chapters.map(chapter => {
                const chapterMaterials = getMaterialsByChapter(chapter.id, activeSection)
                
                return (
                  <div 
                    key={chapter.id} 
                    className="border rounded-lg p-4"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                      <span>{getContentIcon(activeSection)}</span>
                      {chapter.name}
                      <span className="text-sm text-muted ml-2">
                        ({chapterMaterials.length} {activeSection} files)
                      </span>
                    </h3>
                    
                    {chapterMaterials.length > 0 ? (
                      <div className="tablet-grid">
                        {chapterMaterials.map(material => (
                          <div 
                            key={material.id} 
                            className="border rounded p-3 transition-opacity hover:opacity-90 content-card"
                            style={{ 
                              backgroundColor: getContentBgColor(activeSection),
                              borderColor: getContentBorderColor(activeSection)
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getContentIcon(activeSection)}</span>
                                <div>
                                  <h4 className="font-medium text-sm text-primary">{material.title}</h4>
                                  <p className="text-xs text-secondary">
                                    {activeSection === 'quiz' ? 
                                      `${material.total_questions} questions • ${material.time_limit}min` : 
                                      material.type?.toUpperCase()
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {activeSection === 'quiz' ? (
                                  <button
                                    onClick={() => window.location.href = `/teacher-dashboard/quiz/${material.id}/results`}
                                    className="text-sm font-medium transition-colors"
                                    style={{ color: 'var(--purple-600)' }}
                                  >
                                    View Results
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleViewContent(material)}
                                      className="text-sm font-medium px-2 py-1 rounded border transition-colors"
                                      style={{
                                        color: getContentColor(activeSection),
                                        borderColor: getContentColor(activeSection),
                                        backgroundColor: 'transparent'
                                      }}
                                    >
                                      View
                                    </button>
                                    <a
                                      href={material.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-medium transition-colors"
                                      style={{ color: getContentColor(activeSection) }}
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
                      <div className="text-center py-8 text-muted">
                        <span className="text-3xl mb-2 block">{getContentIcon(activeSection)}</span>
                        <p>No {activeSection} materials uploaded yet</p>
                        <p className="text-sm">
                          {activeSection === 'quiz' ? 
                            'Click "Create Quiz" to add quiz assessments' : 
                            'Click "Upload Material" to add content'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-primary rounded-lg p-6 w-full max-w-md mx-4 modal-content">
              <h3 className="text-lg font-bold mb-4 text-primary">Upload Study Material</h3>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-primary">Content Type</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-primary text-primary"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <option value="textbook">📚 TextBook (PDF)</option>
                    <option value="ppt">📊 Presentation (PPT)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-primary">Chapter</label>
                  <select
                    value={uploadForm.chapterId}
                    onChange={(e) => setUploadForm({...uploadForm, chapterId: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-primary text-primary"
                    style={{ borderColor: 'var(--border-color)' }}
                    required
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map(chapter => (
                      <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-primary">Title</label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-primary text-primary"
                    style={{ borderColor: 'var(--border-color)' }}
                    placeholder="Enter material title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-primary">Select File</label>
                  <input
                    type="file"
                    onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-primary text-primary"
                    style={{ borderColor: 'var(--border-color)' }}
                    accept={uploadForm.type === 'textbook' ? '.pdf' : '.ppt,.pptx'}
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 py-2 rounded transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--blue-600)', color: 'white' }}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpload(false)
                      setUploadForm({ title: '', file: null, chapterId: '', type: 'textbook' })
                    }}
                    disabled={uploading}
                    className="flex-1 py-2 rounded transition-opacity hover:opacity-90"
                    style={{ backgroundColor: 'var(--gray-500)', color: 'white' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Quiz Creator Modal - Keep existing implementation but with dark mode styling */}
        {showQuizCreator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-primary rounded-lg p-6 w-full max-w-4xl mx-4 my-8 max-h-screen overflow-y-auto modal-content">
              <h3 className="text-xl font-bold mb-4 text-primary">Create New Quiz</h3>
              
              <form onSubmit={handleCreateQuiz} className="space-y-6">
                {/* Quiz Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-primary">Quiz Title</label>
                    <input
                      type="text"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                      className="w-full p-2 border rounded bg-primary text-primary"
                      style={{ borderColor: 'var(--border-color)' }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-primary">Chapter</label>
                    <select
                      value={quizForm.chapterId}
                      onChange={(e) => setQuizForm({...quizForm, chapterId: e.target.value})}
                      className="w-full p-2 border rounded bg-primary text-primary"
                      style={{ borderColor: 'var(--border-color)' }}
                      required
                    >
                      <option value="">Select Chapter</option>
                      {chapters.map(chapter => (
                        <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-primary">Time Limit (minutes)</label>
                    <input
                      type="number"
                      value={quizForm.timeLimit}
                      onChange={(e) => setQuizForm({...quizForm, timeLimit: parseInt(e.target.value)})}
                      className="w-full p-2 border rounded bg-primary text-primary"
                      style={{ borderColor: 'var(--border-color)' }}
                      min="1"
                      max="180"
                    />
                  </div>
                </div>
                
                {/* Questions */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold text-primary">Questions</h4>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="px-4 py-2 rounded transition-opacity hover:opacity-90"
                      style={{ backgroundColor: 'var(--blue-600)', color: 'white' }}
                    >
                      Add Question
                    </button>
                  </div>
                  
                  {quizForm.questions.map((question, qIndex) => (
                    <div 
                      key={qIndex} 
                      className="border rounded-lg p-4"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h5 className="font-medium text-primary">Question {qIndex + 1}</h5>
                        {quizForm.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            className="transition-colors"
                            style={{ color: 'var(--red-600)' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-primary">Question Text</label>
                          <textarea
                            value={question.questionText}
                            onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                            className="w-full p-2 border rounded bg-primary text-primary"
                            style={{ borderColor: 'var(--border-color)' }}
                            rows="3"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex}>
                              <label className="block text-sm font-medium mb-2 text-primary">
                                Option {oIndex + 1}
                                {question.correctAnswer === oIndex && (
                                  <span style={{ color: 'var(--green-600)' }} className="ml-2">✓ Correct</span>
                                )}
                              </label>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                className="w-full p-2 border rounded bg-primary text-primary"
                                style={{
                                  borderColor: question.correctAnswer === oIndex ? 'var(--green-600)' : 'var(--border-color)',
                                  backgroundColor: question.correctAnswer === oIndex ? 'var(--green-50)' : 'var(--bg-primary)'
                                }}
                                required
                              />
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-primary">Correct Answer</label>
                            <select
                              value={question.correctAnswer}
                              onChange={(e) => updateQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))}
                              className="p-2 border rounded bg-primary text-primary"
                              style={{ borderColor: 'var(--border-color)' }}
                            >
                              <option value={0}>Option 1</option>
                              <option value={1}>Option 2</option>
                              <option value={2}>Option 3</option>
                              <option value={3}>Option 4</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2 text-primary">Marks</label>
                            <input
                              type="number"
                              value={question.marks}
                              onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value))}
                              className="p-2 border rounded w-20 bg-primary text-primary"
                              style={{ borderColor: 'var(--border-color)' }}
                              min="1"
                              max="10"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 py-3 rounded transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--green-600)', color: 'white' }}
                  >
                    {uploading ? 'Creating Quiz...' : 'Create Quiz'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuizCreator(false)
                      setQuizForm({
                        title: '',
                        chapterId: '',
                        timeLimit: 30,
                        questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }]
                      })
                    }}
                    disabled={uploading}
                    className="flex-1 py-3 rounded transition-opacity hover:opacity-90"
                    style={{ backgroundColor: 'var(--gray-500)', color: 'white' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
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
    </div>
  )
}
