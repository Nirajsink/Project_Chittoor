'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function StudentProgressPage() {
  const [user, setUser] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [progressData, setProgressData] = useState([])
  const [loading, setLoading] = useState(false)
  const [classInfo, setClassInfo] = useState(null)
  
  useEffect(() => {
    fetchUser()
    fetchSubjects()
  }, [])
  
  useEffect(() => {
    if (selectedSubject) {
      fetchProgressData(selectedSubject.id)
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
      if (data.subjects?.length > 0) {
        setSelectedSubject(data.subjects[0])
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }
  
  const fetchProgressData = async (subjectId) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/student-progress/${subjectId}`)
      const data = await res.json()
      setProgressData(data.progressData || [])
      setClassInfo(data.classInfo || null)
    } catch (error) {
      console.error('Error fetching progress data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const downloadCSV = () => {
    if (!progressData.length) {
      alert('No data to download')
      return
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
    ]
    
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
    ])
    
    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${selectedSubject?.name}_${classInfo?.name}_Progress_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100'
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100'
    if (percentage >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Student Progress Tracking</h1>
            <p className="text-gray-600">Welcome, {user?.fullName}</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/teacher-dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6">
        {/* Subject Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Select Subject to View Progress</h2>
            {selectedSubject && progressData.length > 0 && (
              <button
                onClick={downloadCSV}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
              >
                <span>📥</span> Download CSV
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject)}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  selectedSubject?.id === subject.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold">{subject.name}</h3>
                <p className="text-sm text-gray-600">{subject.class_name}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Progress Data */}
        {selectedSubject && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">{selectedSubject.name} - Student Progress</h2>
                {classInfo && (
                  <p className="text-gray-600">Class: {classInfo.name} | Total Students: {progressData.length}</p>
                )}
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading student progress...</p>
              </div>
            ) : progressData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Content Progress
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quiz Progress
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Quiz Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Overall Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {progressData.map((student, index) => (
                      <tr key={student.roll_number} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.roll_number}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.full_name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span>{student.content_viewed}/{student.total_content}</span>
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
                                <span>{student.quizzes_attempted}/{student.total_quizzes}</span>
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
              <div className="text-center py-8 text-gray-500">
                <p>No students found for this subject</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
