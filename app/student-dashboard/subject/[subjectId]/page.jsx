'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ContentViewer from '@/components/ContentViewer'
import QuizPlayer from '@/components/QuizPlayer'

const TAB_TYPES = [
  { key: 'textbook', label: 'Textbooks', icon: '📚' },
  { key: 'ppt', label: 'Presentations', icon: '📊' },
  { key: 'quiz', label: 'Quizzes', icon: '🧠' }
]

export default function SubjectContentPage() {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.subjectId

  const [subjectName, setSubjectName] = useState('')
  const [chapterMap, setChapterMap] = useState({})
  const [activeType, setActiveType] = useState('textbook')
  const [loading, setLoading] = useState(true)
  const [viewingContent, setViewingContent] = useState(null)
  const [takingQuiz, setTakingQuiz] = useState(null)
  const [quizResults, setQuizResults] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch('/api/student/content-view')
      .then(res => res.json())
      .then(data => {
        // Filter for this subject
        const filtered = (data.content || []).filter(item => String(item.subject_id) === String(subjectId))
        if (filtered.length === 0) {
          setLoading(false)
          setSubjectName('Not Found')
          setChapterMap({})
          return
        }
        setSubjectName(filtered[0].subject_name)
        // Group by chapter, then by type
        const chapters = {}
        filtered.forEach(item => {
          if (!chapters[item.chapter_id]) {
            chapters[item.chapter_id] = {
              id: item.chapter_id,
              name: item.chapter_name,
              textbook: [],
              ppt: [],
              quiz: []
            }
          }
          if (item.content_type === 'pdf' || item.content_type === 'textbook') {
            chapters[item.chapter_id].textbook.push(item)
          } else if (item.content_type === 'ppt' || item.content_type === 'presentation') {
            chapters[item.chapter_id].ppt.push(item)
          } else if (item.content_type === 'quiz') {
            chapters[item.chapter_id].quiz.push(item)
          }
        })
        setChapterMap(chapters)
        setLoading(false)
      })
  }, [subjectId])

  const handleViewContent = (content) => setViewingContent(content)
  const handleStartQuiz = (content) => setTakingQuiz(content.file_url.split('/').pop())
  const handleQuizComplete = (results) => { setTakingQuiz(null); setQuizResults(results) }
  const closeQuizResults = () => setQuizResults(null)
  const closeContentViewer = () => setViewingContent(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white pb-10">
      <div className="max-w-5xl mx-auto px-4 pt-10">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            ← Back
          </Button>
          <h2 className="text-3xl font-bold text-blue-700">{subjectName}</h2>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {TAB_TYPES.map(tab => (
            <Button
              key={tab.key}
              variant={activeType === tab.key ? "default" : "outline"}
              className={`flex items-center gap-2 px-6 py-2 text-lg rounded-full font-semibold
                ${activeType === tab.key ? "shadow-md scale-105" : ""}
                ${tab.key === "textbook" ? "text-blue-600 border-blue-600" : ""}
                ${tab.key === "ppt" ? "text-green-600 border-green-600" : ""}
                ${tab.key === "quiz" ? "text-yellow-600 border-yellow-400" : ""}
              `}
              style={{
                background: activeType === tab.key
                  ? (tab.key === "textbook"
                    ? "#e0e7ff"
                    : tab.key === "ppt"
                    ? "#d1fae5"
                    : "#fef9c3")
                  : "white"
              }}
              onClick={() => setActiveType(tab.key)}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content by chapter */}
        {loading ? (
          <div className="text-center py-12 text-blue-700 font-medium">Loading...</div>
        ) : Object.keys(chapterMap).length === 0 ? (
          <div className="text-center py-12 text-blue-700 font-medium">No content found for this subject.</div>
        ) : (
          <div className="space-y-8">
            {Object.values(chapterMap).map(chapter => (
              <div key={chapter.id} className="bg-white rounded-xl shadow p-6 border border-blue-100">
                <div className="flex items-center gap-2 mb-4 text-blue-700 font-semibold">
                  <span className="text-xl">📖</span>
                  <span className="text-lg">{chapter.name}</span>
                  <span className="text-sm text-muted ml-2">
                    ({chapter[activeType].length} {activeType})
                  </span>
                </div>
                {chapter[activeType].length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {chapter[activeType].map((content, i) => (
                      <Card key={i} className="flex-1 min-w-[220px] max-w-xs p-4 flex flex-col justify-between bg-blue-50 hover:bg-green-50 transition-all duration-150 shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">
                            {activeType === 'textbook' ? '📚' : activeType === 'ppt' ? '📊' : '🧠'}
                          </span>
                          <span className="font-medium text-base truncate">{content.content_title}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {activeType === 'quiz' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-yellow-400 text-yellow-600 font-semibold"
                              onClick={() => handleStartQuiz(content)}
                            >
                              Take Quiz
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className={activeType === "textbook"
                                ? "border-blue-600 text-blue-600 font-semibold"
                                : "border-green-600 text-green-600 font-semibold"}
                              onClick={() => handleViewContent(content)}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-blue-600 italic pl-2">
                    No {activeType} content for this chapter.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Content Viewer Modal */}
        {viewingContent && (
          <ContentViewer content={viewingContent} onClose={closeContentViewer} />
        )}

        {/* Quiz Player Modal */}
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
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center modal-content shadow-xl">
              <div className={`text-6xl mb-4 ${quizResults.passed ? 'text-green-500' : 'text-blue-600'}`}>
                {quizResults.passed ? '🎉' : '📚'}
              </div>
              <h3 className="text-2xl font-bold mb-2 text-blue-700">Quiz Completed!</h3>
              <div className="text-lg mb-4 text-blue-800">
                Score: {quizResults.score}/{quizResults.totalMarks} ({quizResults.percentage}%)
              </div>
              <p className="mb-6 text-green-700">{quizResults.message}</p>
              <div className="space-y-3">
                <div className="w-full rounded-full h-4 bg-green-100">
                  <div 
                    className="h-4 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${quizResults.percentage}%`,
                      backgroundColor: quizResults.passed ? '#22c55e' : '#2563eb'
                    }}
                  ></div>
                </div>
                <Button
                  onClick={closeQuizResults}
                  className="w-full bg-blue-600 text-white"
                >
                  Continue Learning
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
