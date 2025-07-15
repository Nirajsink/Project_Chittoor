import React from 'react';
import { Button } from "@/components/ui/button"; // Ensure this path is correct
import { Plus } from 'lucide-react'; // Import Plus icon

export default function CreateQuizModal({
  showQuizCreator,
  setShowQuizCreator,
  quizForm,
  setQuizForm,
  handleCreateQuiz,
  uploading,
  chapters,
  addQuestion,
  removeQuestion,
  updateQuestion,
  updateOption
}) {
  if (!showQuizCreator) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-primary rounded-lg p-6 w-full max-w-4xl mx-auto my-8 max-h-screen overflow-y-auto modal-content shadow-lg border border-border">
        <h3 className="text-xl font-bold mb-4 text-primary">Create New Quiz</h3>

        <form onSubmit={handleCreateQuiz} className="space-y-6">
          {/* Quiz Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">Quiz Title</label>
              <input
                type="text"
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                className="w-full p-2 border rounded bg-primary text-primary border-border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-primary">Chapter</label>
              <select
                value={quizForm.chapterId}
                onChange={(e) => setQuizForm({ ...quizForm, chapterId: e.target.value })}
                className="w-full p-2 border rounded bg-primary text-primary border-border"
                required
              >
                <option value="">Select Chapter</option>
                {chapters.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-primary">Time Limit (minutes)</label>
              <input
                type="number"
                value={quizForm.timeLimit}
                onChange={(e) => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) })}
                className="w-full p-2 border rounded bg-primary text-primary border-border"
                min="1"
                max="180"
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-primary">Questions</h4>
              <Button
                type="button"
                onClick={addQuestion}
                className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Question
              </Button>
            </div>

            {quizForm.questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="border rounded-lg p-4 border-border"
              >
                <div className="flex justify-between items-start mb-4">
                  <h5 className="font-medium text-primary">Question {qIndex + 1}</h5>
                  {quizForm.questions.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600 hover:text-red-700"
                      variant="link" // Use link variant for text-only button
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-primary">Question Text</label>
                    <textarea
                      value={question.questionText}
                      onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                      className="w-full p-2 border rounded bg-primary text-primary border-border"
                      rows="3"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex}>
                        <label className="block text-sm font-medium mb-2 text-primary">
                          Option {oIndex + 1}
                          {question.correctAnswer === oIndex && (
                            <span className="text-green-600 ml-2">✓ Correct</span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          className="w-full p-2 border rounded bg-primary text-primary"
                          style={{
                            borderColor: question.correctAnswer === oIndex ? 'var(--green-600)' : 'var(--border-color)',
                            backgroundColor: question.correctAnswer === oIndex ? 'var(--green-50)' : 'var(--bg-primary)'
                          }}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-primary">Correct Answer</label>
                      <select
                        value={question.correctAnswer}
                        onChange={(e) => updateQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))}
                        className="p-2 border rounded bg-primary text-primary border-border"
                      >
                        <option value={0}>Option 1</option>
                        <option value={1}>Option 2</option>
                        <option value={2}>Option 3</option>
                        <option value={3}>Option 4</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-primary">Marks</label>
                      <input
                        type="number"
                        value={question.marks}
                        onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value))}
                        className="p-2 border rounded w-20 bg-primary text-primary border-border"
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={uploading}
              className="flex-1 py-3 rounded transition-opacity hover:opacity-90 disabled:opacity-50 bg-green-600 text-white hover:bg-green-700"
            >
              {uploading ? 'Creating Quiz...' : 'Create Quiz'}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowQuizCreator(false);
                setQuizForm({
                  title: '',
                  chapterId: '',
                  timeLimit: 30,
                  questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }]
                });
              }}
              disabled={uploading}
              className="flex-1 py-3 rounded transition-opacity hover:opacity-90 bg-gray-500 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
