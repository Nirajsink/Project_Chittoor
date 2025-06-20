'use client'
import { useState } from 'react'

export default function QuizCreator({ chapterId, onQuizCreated }) {
  const [quizData, setQuizData] = useState({
    title: '',
    type: 'chapter',
    timeLimit: 30
  })
  const [questions, setQuestions] = useState([{
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 1
  }])
  const [creating, setCreating] = useState(false)
  
  const addQuestion = () => {
    setQuestions([...questions, {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1
    }])
  }
  
  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }
  
  const updateQuestion = (index, field, value) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }
  
  const updateOption = (questionIndex, optionIndex, value) => {
    const updated = [...questions]
    updated[questionIndex].options[optionIndex] = value
    setQuestions(updated)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate questions
    const isValid = questions.every(q => 
      q.questionText.trim() && 
      q.options.every(opt => opt.trim()) &&
      q.correctAnswer >= 0 && q.correctAnswer < 4
    )
    
    if (!isValid) {
      alert('Please fill in all questions and options')
      return
    }
    
    setCreating(true)
    
    try {
      const response = await fetch('/api/quiz/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          ...quizData,
          questions
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('Quiz created successfully!')
        onQuizCreated?.()
        // Reset form
        setQuizData({ title: '', type: 'chapter', timeLimit: 30 })
        setQuestions([{
          questionText: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          marks: 1
        }])
      } else {
        alert(data.error || 'Failed to create quiz')
      }
    } catch (error) {
      alert('Error creating quiz: ' + error.message)
    } finally {
      setCreating(false)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">Create New Quiz</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              value={quizData.title}
              onChange={(e) => setQuizData({...quizData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Type
            </label>
            <select
              value={quizData.type}
              onChange={(e) => setQuizData({...quizData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="chapter">Chapter Quiz</option>
              <option value="annual">Annual Quiz</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              value={quizData.timeLimit}
              onChange={(e) => setQuizData({...quizData, timeLimit: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Question
            </button>
          </div>
          
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h5 className="font-medium">Question {qIndex + 1}</h5>
                {questions.length > 1 && (
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={question.questionText}
                    onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Option {oIndex + 1}
                        {question.correctAnswer === oIndex && (
                          <span className="text-green-600 ml-2">✓ Correct</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          question.correctAnswer === oIndex 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-300'
                        }`}
                        required
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer
                    </label>
                    <select
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value={0}>Option 1</option>
                      <option value={1}>Option 2</option>
                      <option value={2}>Option 3</option>
                      <option value={3}>Option 4</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marks
                    </label>
                    <input
                      type="number"
                      value={question.marks}
                      onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-md w-20"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button
          type="submit"
          disabled={creating}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {creating ? 'Creating Quiz...' : 'Create Quiz'}
        </button>
      </form>
    </div>
  )
}
