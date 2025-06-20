import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { quizId, answers } = await request.json()
    
    if (!quizId || !answers) {
      return NextResponse.json(
        { error: 'Missing quiz ID or answers' },
        { status: 400 }
      )
    }
    
    // Check if student has already attempted this quiz
    const { data: existingAttempt } = await supabase
      .from('student_attempts')
      .select('id')
      .eq('student_id', session.userId)
      .eq('quiz_id', quizId)
      .single()
    
    if (existingAttempt) {
      return NextResponse.json(
        { error: 'Quiz already attempted' },
        { status: 409 }
      )
    }
    
    // Get quiz questions with correct answers
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, correct_answer, marks')
      .eq('quiz_id', quizId)
    
    if (questionsError) throw questionsError
    
    // Calculate score
    let score = 0
    let totalMarks = 0
    
    questions.forEach(question => {
      totalMarks += question.marks
      const studentAnswer = answers[question.id]
      
      if (studentAnswer !== undefined && studentAnswer === question.correct_answer) {
        score += question.marks
      }
    })
    
    // Save attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('student_attempts')
      .insert([{
        student_id: session.userId,
        quiz_id: quizId,
        score,
        total_marks: totalMarks,
        answers
      }])
      .select()
      .single()
    
    if (attemptError) throw attemptError
    
    return NextResponse.json({
      message: 'Quiz submitted successfully',
      score,
      totalMarks,
      percentage: Math.round((score / totalMarks) * 100)
    })
    
  } catch (error) {
    console.error('Quiz submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}
