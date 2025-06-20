'use client'
import { useState, useEffect } from 'react'

export default function StudentAnalytics() {
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchProgress()
  }, [])
  
  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/analytics/student/progress')
      const data = await response.json()
      setProgress(data.progress || [])
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Progress</h2>
      
      {progress.map((subjectData, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">{subjectData.subject}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Content Progress */}
            <div>
              <h4 className="font-medium mb-3">Content Progress</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Materials Viewed</span>
                  <span>{subjectData.contentProgress.viewed}/{subjectData.contentProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${subjectData.contentProgress.percentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  Average Completion: {subjectData.contentProgress.avgCompletion}%
                </div>
              </div>
            </div>
            
            {/* Quiz Progress */}
            <div>
              <h4 className="font-medium mb-3">Quiz Performance</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Quizzes Attempted</span>
                  <span>{subjectData.quizProgress.attempted}/{subjectData.quizProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${subjectData.quizProgress.percentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  Average Score: {subjectData.quizProgress.avgScore}%
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
