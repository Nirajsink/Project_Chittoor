'use client'
import { useState, useEffect } from 'react'

export default function StudentDashboard() {
  const [user, setUser] = useState(null)
  const [contentData, setContentData] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [subjectContent, setSubjectContent] = useState({})
  const [activeSection, setActiveSection] = useState('textbook')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchUser()
  }, [])
  
  useEffect(() => {
    if (user?.rollNumber) {
      fetchStudentContent()
    }
  }, [user])
  
  useEffect(() => {
    if (contentData.length > 0) {
      organizeContentBySubjects()
    }
  }, [contentData])
  
  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setUser(data.user)
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }
  
  const fetchStudentContent = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/student/content-view')
      const data = await res.json()
      
      setContentData(data.content || [])
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const organizeContentBySubjects = () => {
    const subjectMap = {}
    const subjectsList = []
    
    contentData.forEach(item => {
      const subjectName = item.subject_name
      
      // Create subject entry if doesn't exist
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = {
          name: subjectName,
          chapters: {}
        }
        subjectsList.push(subjectMap[subjectName])
      }
      
      const chapterName = item.chapter_name
      
      // Create chapter entry if doesn't exist
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
    
    // Auto-select first subject
    if (subjectsList.length > 0 && !selectedSubject) {
      setSelectedSubject(subjectsList[0])
    }
  }
  
  // Add content analytics tracking function
  const trackContentView = async (contentId) => {
    try {
      await fetch('/api/content/analytics/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          timeSpent: 30 // Track 30 seconds per view
        })
      })
    } catch (error) {
      console.error('Error tracking content view:', error)
    }
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
  
  const getFileUrl = (content) => {
    if (content.file_url && content.file_url.startsWith('http')) {
      return content.file_url
    }
    return content.file_url || '#'
  }
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }
  
  const getCurrentSubjectContent = () => {
    if (!selectedSubject || !subjectContent[selectedSubject.name]) {
      return {}
    }
    return subjectContent[selectedSubject.name].chapters
  }
  
  const getTotalContentCount = (type) => {
    const chapters = getCurrentSubjectContent()
    return Object.values(chapters).reduce((total, chapter) => {
      return total + (chapter[type]?.length || 0)
    }, 0)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your subjects...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.fullName} - Class {user?.class}</p>
          </div>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Logout
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6">
        {/* Subject Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">My Subjects</h2>
          
          {subjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-4 block">📚</span>
              <h3 className="text-lg font-medium mb-2">No Subjects Available</h3>
              <p className="text-sm">Your subjects haven't been set up yet. Contact your teacher or admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject, index) => {
                const chapterCount = Object.keys(subjectContent[subject.name]?.chapters || {}).length
                const totalContent = Object.values(subjectContent[subject.name]?.chapters || {}).reduce((total, chapter) => {
                  return total + (chapter.textbook?.length || 0) + (chapter.ppt?.length || 0) + (chapter.quiz?.length || 0)
                }, 0)
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedSubject(subject)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedSubject?.name === subject.name
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{subject.name}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">{selectedSubject.name} - Study Materials</h2>
            
            {/* Content Type Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
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
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
                      activeSection === section.key 
                        ? 'bg-white shadow text-blue-600 font-semibold' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="font-medium">{section.label}</span>
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
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
                const color = getContentColor(activeSection)
                
                return (
                  <div key={chapterName} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                      <span>{getContentIcon(activeSection)}</span>
                      {chapterName}
                      <span className="text-sm text-gray-500 ml-2">
                        ({sectionContent.length} {activeSection} files)
                      </span>
                    </h3>
                    
                    {sectionContent.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sectionContent.map((content, index) => (
                          <div key={index} className={`bg-${color}-50 border border-${color}-200 rounded p-3 hover:bg-${color}-100 transition-colors`}>
                            <a
                              href={getFileUrl(content)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => trackContentView(content.id)}
                              className="flex items-center justify-between text-blue-600 hover:text-blue-800"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getContentIcon(activeSection)}</span>
                                <div>
                                  <h4 className="font-medium text-sm">{content.content_title}</h4>
                                  <p className="text-xs text-gray-600">{content.content_type?.toUpperCase()}</p>
                                </div>
                              </div>
                              <span className={`text-${color}-600 hover:text-${color}-800 text-sm font-medium`}>
                                Open
                              </span>
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
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
    </div>
  )
}
