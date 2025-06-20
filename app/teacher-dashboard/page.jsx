'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function TeacherDashboard() {
  const [user, setUser] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [chapters, setChapters] = useState([])
  const [materials, setMaterials] = useState({
    textbook: [],
    ppt: [],
    quiz: []
  })
  const [showUpload, setShowUpload] = useState(false)
  const [showQuizCreator, setShowQuizCreator] = useState(false)
  const [activeSection, setActiveSection] = useState('textbook')
  const [uploading, setUploading] = useState(false)
  
  const [uploadForm, setUploadForm] = useState({
    title: '',
    file: null,
    chapterId: '',
    type: 'textbook'
  })
  
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
  
  useEffect(() => {
    fetchUser()
    fetchSubjects()
  }, [])
  
  useEffect(() => {
    if (selectedSubject) {
      fetchChapters(selectedSubject.id)
      fetchMaterials(selectedSubject.id)
    }
  }, [selectedSubject])
  
  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setUser(data.user)
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }
  
  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/teacher/subjects')
      const data = await res.json()
      setSubjects(data.subjects || [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }
  
  const fetchChapters = async (subjectId) => {
    try {
      const res = await fetch(`/api/teacher/chapters/${subjectId}`)
      const data = await res.json()
      setChapters(data.chapters || [])
    } catch (error) {
      console.error('Error fetching chapters:', error)
    }
  }
  
  const fetchMaterials = async (subjectId) => {
    try {
      const res = await fetch(`/api/teacher/materials/${subjectId}`)
      const data = await res.json()
      const allMaterials = data.materials || []
      
      // Get quizzes separately
      const quizRes = await fetch(`/api/teacher/quizzes/${subjectId}`)
      const quizData = await quizRes.json()
      const quizzes = quizData.quizzes || []
      
      setMaterials({
        textbook: allMaterials.filter(m => m.type === 'textbook' || m.type === 'pdf'),
        ppt: allMaterials.filter(m => m.type === 'ppt' || m.type === 'presentation'),
        quiz: quizzes
      })
    } catch (error) {
      console.error('Error fetching materials:', error)
    }
  }
  
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
      const res = await fetch('/api/teacher/upload-material', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      
      if (res.ok) {
        alert('Material uploaded successfully!')
        setUploadForm({ title: '', file: null, chapterId: '', type: 'textbook' })
        setShowUpload(false)
        fetchMaterials(selectedSubject.id)
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
      const res = await fetch('/api/teacher/create-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizForm.title,
          chapterId: quizForm.chapterId,
          timeLimit: quizForm.timeLimit,
          questions: quizForm.questions
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert('Quiz created successfully!')
        setQuizForm({
          title: '',
          chapterId: '',
          timeLimit: 30,
          questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }]
        })
        setShowQuizCreator(false)
        fetchMaterials(selectedSubject.id)
      } else {
        alert(data.error || 'Failed to create quiz')
      }
    } catch (error) {
      alert('Error creating quiz: ' + error.message)
    } finally {
      setUploading(false)
    }
  }
  
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
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }
  
  const getMaterialsByChapter = (chapterId, type) => {
    return materials[type].filter(material => material.chapter_id === chapterId)
  }
  
  const getContentIcon = (type) => {
    switch(type) {
      case 'textbook': return '📚'
      case 'ppt': return '📊'
      case 'quiz': return '🧠'
      default: return '📄'
    }
  }
  
  const getContentColor = (type) => {
    switch(type) {
      case 'textbook': return 'blue'
      case 'ppt': return 'green'
      case 'quiz': return 'purple'
      default: return 'gray'
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* Header */}
<header className="bg-white shadow border-b">
  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
    <div>
      <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
      <p className="text-gray-600">Welcome, {user?.fullName}</p>
    </div>
    <div className="flex gap-2">
      <Link
        href="/teacher-dashboard/progress"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
      >
        <span>📊</span> Student Progress
      </Link>
      <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
        Logout
      </button>
    </div>
  </div>
</header>

      
      <main className="max-w-7xl mx-auto p-6">
        {/* Subject Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">My Subjects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map(subject => (
              <div
                key={subject.id}
                onClick={() => setSelectedSubject(subject)}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedSubject?.id === subject.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {subject.class_name}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{subject.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>📚 Click to manage materials</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Selected Subject Content Management */}
        {selectedSubject && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{selectedSubject.name} - Content Management</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowUpload(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <span>📤</span> Upload Material
                </button>
                <button
                  onClick={() => setShowQuizCreator(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2"
                >
                  <span>🧠</span> Create Quiz
                </button>
              </div>
            </div>
            
            {/* Content Type Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              {[
                { key: 'textbook', label: 'TextBooks (PDF)', icon: '📚' },
                { key: 'ppt', label: 'Presentations (PPT)', icon: '📊' },
                { key: 'quiz', label: 'Quizzes', icon: '🧠' }
              ].map(section => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
                    activeSection === section.key 
                      ? 'bg-white shadow text-blue-600 font-semibold' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="font-medium">{section.label}</span>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {materials[section.key].length}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Content Display by Chapters */}
            <div className="space-y-6">
              {chapters.map(chapter => {
                const chapterMaterials = getMaterialsByChapter(chapter.id, activeSection)
                const color = getContentColor(activeSection)
                
                return (
                  <div key={chapter.id} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                      <span>{getContentIcon(activeSection)}</span>
                      {chapter.name}
                      <span className="text-sm text-gray-500 ml-2">
                        ({chapterMaterials.length} {activeSection} files)
                      </span>
                    </h3>
                    
                    {chapterMaterials.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {chapterMaterials.map(material => (
                          <div key={material.id} className={`bg-${color}-50 border border-${color}-200 rounded p-3 hover:bg-${color}-100 transition-colors`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getContentIcon(activeSection)}</span>
                                <div>
                                  <h4 className="font-medium text-sm">{material.title}</h4>
                                  <p className="text-xs text-gray-600">
                                    {activeSection === 'quiz' ? 
                                      `${material.total_questions} questions • ${material.time_limit}min` : 
                                      material.type?.toUpperCase()
                                    }
                                  </p>
                                </div>
                              </div>
                              {activeSection === 'quiz' ? (
                                <button
                                  onClick={() => window.location.href = `/teacher-dashboard/quiz/${material.id}/results`}
                                  className={`text-${color}-600 hover:text-${color}-800 text-sm font-medium`}
                                >
                                  View Results
                                </button>
                              ) : (
                                <a
                                  href={material.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-${color}-600 hover:text-${color}-800 text-sm font-medium`}
                                >
                                  Open
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
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
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold mb-4">Upload Study Material</h3>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Content Type</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="textbook">📚 TextBook (PDF)</option>
                    <option value="ppt">📊 Presentation (PPT)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Chapter</label>
                  <select
                    value={uploadForm.chapterId}
                    onChange={(e) => setUploadForm({...uploadForm, chapterId: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map(chapter => (
                      <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter material title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Select File</label>
                  <input
                    type="file"
                    onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    accept={uploadForm.type === 'textbook' ? '.pdf' : '.ppt,.pptx'}
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
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
                    className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Quiz Creator Modal */}
        {showQuizCreator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 my-8 max-h-screen overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Create New Quiz</h3>
              
              <form onSubmit={handleCreateQuiz} className="space-y-6">
                {/* Quiz Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quiz Title</label>
                    <input
                      type="text"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Chapter</label>
                    <select
                      value={quizForm.chapterId}
                      onChange={(e) => setQuizForm({...quizForm, chapterId: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select Chapter</option>
                      {chapters.map(chapter => (
                        <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
                    <input
                      type="number"
                      value={quizForm.timeLimit}
                      onChange={(e) => setQuizForm({...quizForm, timeLimit: parseInt(e.target.value)})}
                      className="w-full p-2 border rounded"
                      min="1"
                      max="180"
                    />
                  </div>
                </div>
                
                {/* Questions */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Questions</h4>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Add Question
                    </button>
                  </div>
                  
                  {quizForm.questions.map((question, qIndex) => (
                    <div key={qIndex} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h5 className="font-medium">Question {qIndex + 1}</h5>
                        {quizForm.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Question Text</label>
                          <textarea
                            value={question.questionText}
                            onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                            className="w-full p-2 border rounded"
                            rows="3"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex}>
                              <label className="block text-sm font-medium mb-2">
                                Option {oIndex + 1}
                                {question.correctAnswer === oIndex && (
                                  <span className="text-green-600 ml-2">✓ Correct</span>
                                )}
                              </label>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                className={`w-full p-2 border rounded ${
                                  question.correctAnswer === oIndex 
                                    ? 'border-green-500 bg-green-50' 
                                    : ''
                                }`}
                                required
                              />
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Correct Answer</label>
                            <select
                              value={question.correctAnswer}
                              onChange={(e) => updateQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))}
                              className="p-2 border rounded"
                            >
                              <option value={0}>Option 1</option>
                              <option value={1}>Option 2</option>
                              <option value={2}>Option 3</option>
                              <option value={3}>Option 4</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Marks</label>
                            <input
                              type="number"
                              value={question.marks}
                              onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value))}
                              className="p-2 border rounded w-20"
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
                    className="flex-1 bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:opacity-50"
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
                    className="flex-1 bg-gray-500 text-white py-3 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
