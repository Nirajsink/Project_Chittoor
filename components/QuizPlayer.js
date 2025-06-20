'use client'
import { useState, useEffect, useCallback } from 'react'

export default function QuizPlayer({ quizId, onQuizComplete }) {
  const [quiz, setQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const fetchQuiz = useCallback(async () => {
    try {
      const response = await fetch(`/api/quiz/${quizId}`)
      const data = await response.json()
      
      if (response.ok) {
        setQuiz(data.quiz)
        setTimeLeft(data.quiz.time_limit * 60) 
      } else {
        alert(data.error || 'Failed to load quiz')
      }
    } catch (error) {
      alert('Error loading quiz: ' + error.message)
    } finally {
      setLoading(false)
    }
  }, [quizId])
  
  const handleSubmit = useCallback(async () => {
    if (submitting) return
    
    setSubmitting(true)
    
    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          answers
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        onQuizComplete?.(data)
      } else {
        alert(data.error || 'Failed to submit quiz')
      }
    } catch (error) {
      alert('Error submitting quiz: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }, [submitting, quizId, answers, onQuizComplete])
  
  useEffect(() => {
    fetchQuiz()
  }, [fetchQuiz])
  
  useEffect(() => {
    if (quiz && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && quiz) {
      handleSubmit()
    }
  }, [timeLeft, quiz, handleSubmit])
  
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
    return <div className="text-center py-8">Loading quiz...</div>
  }
  
  if (!quiz) {
    return <div className="text-center py-8">Quiz not found</div>
  }
  
  const currentQ = quiz.questions[currentQuestion]
  
  return (
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
  )
}
