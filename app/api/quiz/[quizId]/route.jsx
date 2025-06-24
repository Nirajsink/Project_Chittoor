import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const session = await getSession()
    const { quizId } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get quiz with questions
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        id,
        title,
        type,
        total_questions,
        time_limit,
        chapter_id,
        chapters(name, subjects(name))
      `)
      .eq('id', quizId)
      .single()
    
    if (quizError || !quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }
    
    // Get questions for this quiz
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, question_text, options, marks')
      .eq('quiz_id', quizId)
      .order('created_at')
    
    if (questionsError) {
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }
    
    // Check if student has already attempted this quiz
    let hasAttempted = false
    if (session.role === 'student') {
      const { data: attempt } = await supabase
        .from('student_attempts')
        .select('id')
        .eq('student_id', session.userId)
        .eq('quiz_id', quizId)
        .single()
      
      hasAttempted = !!attempt
    }
    
    return NextResponse.json({
      quiz: {
        ...quiz,
        questions,
        hasAttempted
      }
    })
    
  } catch (error) {
    console.error('Quiz fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
