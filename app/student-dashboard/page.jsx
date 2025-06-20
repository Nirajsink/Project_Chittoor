'use client'
import { useState, useEffect } from 'react'

export default function StudentDashboard() {
  const [user, setUser] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [chapters, setChapters] = useState([])
  const [materials, setMaterials] = useState({
    textbook: [],
    ppt: [],
    quiz: []
  })
  const [activeSection, setActiveSection] = useState('textbook')
  
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
      const res = await fetch('/api/student/subjects')
      const data = await res.json()
      setSubjects(data.subjects || [])
      if (data.subjects?.length > 0) {
        setSelectedSubject(data.subjects[0])
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }
  
  const fetchChapters = async (subjectId) => {
    try {
      const res = await fetch(`/api/student/chapters/${subjectId}`)
      const data = await res.json()
      setChapters(data.chapters || [])
    } catch (error) {
      console.error('Error fetching chapters:', error)
    }
  }
  
  const fetchMaterials = async (subjectId) => {
    try {
      const res = await fetch(`/api/student/content/${subjectId}`)
      const data = await res.json()
      const allMaterials = data.contents || []
      
      // Get quizzes separately
      const quizRes = await fetch(`/api/student/quizzes/${subjectId}`)
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
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }
  
  const getFileUrl = (content) => {
    if (content.file_url.startsWith('http')) {
      return content.file_url
    }
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-materials/${content.file_url}`
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
  
  const checkQuizAttempted = async (quizId) => {
    try {
      const res = await fetch(`/api/student/quiz-attempt/${quizId}`)
      const data = await res.json()
      return data.attempted
    } catch (error) {
      return false
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.fullName} - {user?.class}</p>
          </div>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Logout
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6">
        {/* Subject Selection */}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{subject.name}</h3>
                <p className="text-gray-600 text-sm">{subject.description}</p>
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <span>📚 Click to view study materials</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Selected Subject Study Materials */}
        {selectedSubject && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">{selectedSubject.name} - Study Materials</h2>
            
            {/* Content Type Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              {[
                { key: 'textbook', label: 'TextBooks', icon: '📚' },
                { key: 'ppt', label: 'Presentations', icon: '📊' },
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
                            {activeSection === 'quiz' ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{getContentIcon(activeSection)}</span>
                                  <div>
                                    <h4 className="font-medium text-sm">{material.title}</h4>
                                    <p className="text-xs text-gray-600">
                                      {material.total_questions} questions • {material.time_limit}min
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => window.location.href = `/student-dashboard/quiz/${material.id}`}
                                  className={`text-${color}-600 hover:text-${color}-800 text-sm font-medium px-3 py-1 rounded border border-${color}-300`}
                                >
                                  Take Quiz
                                </button>
                              </div>
                            ) : (
                              <a
                                href={getFileUrl(material)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between text-blue-600 hover:text-blue-800"
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{getContentIcon(activeSection)}</span>
                                  <div>
                                    <h4 className="font-medium text-sm">{material.title}</h4>
                                    <p className="text-xs text-gray-600">{material.type?.toUpperCase()}</p>
                                  </div>
                                </div>
                                <span className={`text-${color}-600 hover:text-${color}-800 text-sm font-medium`}>
                                  Open
                                </span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <span className="text-3xl mb-2 block">{getContentIcon(activeSection)}</span>
                        <p>No {activeSection} materials available</p>
                        <p className="text-sm">Your teacher hasn't uploaded {activeSection} content yet</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
