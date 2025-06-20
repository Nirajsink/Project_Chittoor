'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function QuizTakingPage() {
  const params = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [results, setResults] = useState(null)
  
  const fetchQuiz = useCallback(async () => {
    try {
      const response = await fetch(`/api/quiz/${params.quizId}`)
      const data = await response.json()
      
      if (response.ok) {
        setQuiz(data.quiz)
        setTimeLeft(data.quiz.time_limit * 60)
      } else {
        alert(data.error || 'Failed to load quiz')
        router.push('/student-dashboard')
      }
    } catch (error) {
      alert('Error loading quiz: ' + error.message)
      router.push('/student-dashboard')
    } finally {
      setLoading(false)
    }
  }, [params.quizId, router])
  
  const handleSubmit = useCallback(async () => {
    if (submitting) return
    
    setSubmitting(true)
    
    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: params.quizId,
          answers
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResults(data)
        setQuizCompleted(true)
      } else {
        alert(data.error || 'Failed to submit quiz')
      }
    } catch (error) {
      alert('Error submitting quiz: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }, [submitting, params.quizId, answers])
  
  useEffect(() => {
    fetchQuiz()
  }, [fetchQuiz])
  
  useEffect(() => {
    if (quiz && timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && quiz && !quizCompleted) {
      handleSubmit()
    }
  }, [timeLeft, quiz, quizCompleted, handleSubmit])
  
  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    })
  }
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    )
  }
  
  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Quiz not found</p>
          <button
            onClick={() => router.push('/student-dashboard')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }
  
  if (quizCompleted && results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-3xl font-bold text-blue-600">
                {Math.round(results.percentage)}%
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
            <p className="text-gray-600">Here are your results</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{results.score}</div>
              <div className="text-sm text-gray-600">Points Scored</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-600">{results.totalMarks}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{results.percentage}%</div>
              <div className="text-sm text-gray-600">Percentage</div>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div 
                className={`h-4 rounded-full transition-all duration-1000 ${
                  results.percentage >= 60 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${results.percentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {results.percentage >= 60 ? 'Congratulations! You passed!' : 'Keep studying and try again!'}
            </p>
          </div>
          
          <button
            onClick={() => router.push('/student-dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }
  
  const currentQ = quiz.questions[currentQuestion]
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        {/* Quiz Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">{quiz.title}</h2>
            <p className="text-gray-600">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-gray-600">Time Remaining</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Question */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">
            {currentQ.question_text}
          </h3>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQ.id, index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  answers[currentQ.id] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-600">
            {Object.keys(answers).length} of {quiz.questions.length} answered
          </div>
          
          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
