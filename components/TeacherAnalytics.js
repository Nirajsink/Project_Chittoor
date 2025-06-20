'use client'
import { useState, useEffect } from 'react'

export default function TeacherAnalytics() {
  const [performance, setPerformance] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchPerformance()
  }, [])
  
  const fetchPerformance = async () => {
    try {
      const response = await fetch('/api/analytics/teacher/class-performance')
      const data = await response.json()
      setPerformance(data.performance || [])
    } catch (error) {
      console.error('Error fetching performance:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Class Performance Analytics</h2>
      
      {performance.map((classData, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold">{classData.subject}</h3>
              <p className="text-gray-600">Class: {classData.class}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {classData.metrics.engagementRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Engagement Rate</div>
            </div>
          </div>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {classData.metrics.totalStudents}
              </div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {classData.metrics.activeStudents}
              </div>
              <div className="text-sm text-gray-600">Active Students</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {classData.metrics.avgQuizScore}%
              </div>
              <div className="text-sm text-gray-600">Avg Quiz Score</div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600">
                {classData.metrics.avgTimeSpent}m
              </div>
              <div className="text-sm text-gray-600">Avg Study Time</div>
            </div>
          </div>
          
          {/* Top Performers */}
          <div>
            <h4 className="font-medium mb-3">Top Performers</h4>
            <div className="space-y-2">
              {classData.topPerformers.map((performer, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{performer.name}</span>
                  <span className="text-green-600 font-semibold">{performer.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
