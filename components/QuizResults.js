'use client'

export default function QuizResults({ results, onRetakeQuiz, onBackToDashboard }) {
  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' }
    if (percentage >= 80) return { grade: 'A', color: 'text-green-500' }
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600' }
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600' }
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-600' }
    return { grade: 'F', color: 'text-red-600' }
  }
  
  const gradeInfo = getGrade(results.percentage)
  
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 text-center">
      <div className="mb-6">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <span className={`text-3xl font-bold ${gradeInfo.color}`}>
            {gradeInfo.grade}
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
          <div className={`text-2xl font-bold ${gradeInfo.color}`}>
            {results.percentage}%
          </div>
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
      
      <div className="flex gap-4 justify-center">
        <button
          onClick={onBackToDashboard}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
        
        {results.percentage < 60 && (
          <button
            onClick={onRetakeQuiz}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Study More
          </button>
        )}
      </div>
    </div>
  )
}
