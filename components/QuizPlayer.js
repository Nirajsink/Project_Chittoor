'use client'
import { useState, useEffect, useCallback } from 'react'

export default function QuizPlayer({ quizId, onQuizComplete, onClose }) {
  const [quiz, setQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  
  // Initialize dark mode from current theme
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme')
    setDarkMode(currentTheme === 'dark')
    
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme')
          setDarkMode(newTheme === 'dark')
        }
      })
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })
    
    return () => observer.disconnect()
  }, [])
  
  const fetchQuiz = useCallback(async () => {
    try {
      const response = await fetch(`/api/quiz/${quizId}`)
      const data = await response.json()
      
      if (response.ok) {
        if (data.quiz.hasAttempted) {
          alert('You have already attempted this quiz!')
          onClose()
          return
        }
        setQuiz(data.quiz)
        setTimeLeft(data.quiz.time_limit * 60) // Convert minutes to seconds
      } else {
        alert(data.error || 'Failed to load quiz')
        onClose()
      }
    } catch (error) {
      alert('Error loading quiz: ' + error.message)
      onClose()
    } finally {
      setLoading(false)
    }
  }, [quizId, onClose])
  
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
        onQuizComplete(data)
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
  
  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / quiz.questions.length) * 100
  }
  
  const getAnsweredCount = () => {
    return Object.keys(answers).length
  }
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-primary rounded-lg p-8 modal-content">
          <div className="text-center">
            <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
            <p className="text-primary">Loading quiz...</p>
          </div>
        </div>
      </div>
    )
  }
  
  if (!quiz) {
    return null
  }
  
  const currentQ = quiz.questions[currentQuestion]
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-primary rounded-lg w-full max-w-4xl max-h-[90vh] m-4 flex flex-col modal-content">
        {/* Quiz Header */}
        <div 
          className="flex justify-between items-center p-6 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div>
            <h2 className="text-2xl font-bold text-primary">{quiz.title}</h2>
            <p className="text-secondary">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
          </div>
          <div className="text-right">
            <div 
              className="text-2xl font-bold"
              style={{ 
                color: timeLeft < 300 ? 'var(--red-600)' : 'var(--blue-600)' 
              }}
            >
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-secondary">Time Remaining</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-6 py-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-secondary">Progress</span>
            <span className="text-sm text-secondary">
              {getAnsweredCount()} of {quiz.questions.length} answered
            </span>
          </div>
          <div 
            className="w-full rounded-full h-3"
            style={{ backgroundColor: 'var(--gray-200)' }}
          >
            <div 
              className="h-3 rounded-full transition-all duration-300"
              style={{ 
                width: `${getProgressPercentage()}%`,
                backgroundColor: 'var(--blue-600)'
              }}
            ></div>
          </div>
        </div>
        
        {/* Question */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span 
                className="text-sm px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: 'var(--blue-100)', 
                  color: 'var(--blue-800)' 
                }}
              >
                Question {currentQuestion + 1}
              </span>
              <span className="text-sm text-secondary">
                {currentQ.marks} {currentQ.marks === 1 ? 'mark' : 'marks'}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-primary mb-6">
              {currentQ.question_text}
            </h3>
          </div>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              const isSelected = answers[currentQ.id] === index
              const optionLetter = String.fromCharCode(65 + index)
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQ.id, index)}
                  className="w-full text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                  style={{
                    borderColor: isSelected ? 'var(--blue-600)' : 'var(--border-color)',
                    backgroundColor: isSelected ? 'var(--blue-50)' : 'var(--bg-primary)',
                    boxShadow: isSelected ? 'var(--shadow)' : 'none'
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <span 
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                      style={{
                        backgroundColor: isSelected ? 'var(--blue-600)' : 'var(--gray-200)',
                        color: isSelected ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      {optionLetter}
                    </span>
                    <span className="text-primary flex-1">{option}</span>
                    {isSelected && (
                      <span style={{ color: 'var(--blue-600)' }}>✓</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Navigation */}
        <div 
          className="flex justify-between items-center p-6 border-t"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-2 rounded-md transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ 
              backgroundColor: 'var(--gray-500)', 
              color: 'white' 
            }}
          >
            ← Previous
          </button>
          
          <div className="text-center">
            <div className="text-sm text-secondary mb-1">
              {getAnsweredCount()} of {quiz.questions.length} questions answered
            </div>
            <div 
              className="text-xs px-2 py-1 rounded"
              style={{ 
                backgroundColor: getAnsweredCount() === quiz.questions.length ? 'var(--green-100)' : 'var(--yellow-100)',
                color: getAnsweredCount() === quiz.questions.length ? 'var(--green-800)' : 'var(--yellow-800)'
              }}
            >
              {getAnsweredCount() === quiz.questions.length ? 'All questions answered' : 'Some questions unanswered'}
            </div>
          </div>
          
          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="px-6 py-2 rounded-md transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: 'var(--blue-600)', 
                color: 'white' 
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-2 rounded-md transition-opacity hover:opacity-90 disabled:opacity-50 font-semibold"
              style={{ 
                backgroundColor: 'var(--green-600)', 
                color: 'white' 
              }}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="loading-spinner h-4 w-4"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Quiz'
              )}
            </button>
          )}
        </div>
        
        {/* Warning for unanswered questions */}
        {currentQuestion === quiz.questions.length - 1 && getAnsweredCount() < quiz.questions.length && (
          <div 
            className="mx-6 mb-4 p-3 rounded-md"
            style={{ 
              backgroundColor: 'var(--yellow-50)', 
              borderColor: 'var(--yellow-200)',
              border: '1px solid'
            }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--yellow-600)' }}>⚠️</span>
              <span className="text-sm" style={{ color: 'var(--yellow-800)' }}>
                You have {quiz.questions.length - getAnsweredCount()} unanswered questions. 
                You can go back to answer them before submitting.
              </span>
            </div>
          </div>
        )}
        
        {/* Time warning */}
        {timeLeft <= 300 && timeLeft > 0 && (
          <div 
            className="mx-6 mb-4 p-3 rounded-md"
            style={{ 
              backgroundColor: 'var(--red-50)', 
              borderColor: 'var(--red-200)',
              border: '1px solid'
            }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--red-600)' }}>⏰</span>
              <span className="text-sm font-medium" style={{ color: 'var(--red-800)' }}>
                Only {Math.floor(timeLeft / 60)} minutes remaining! The quiz will auto-submit when time expires.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
