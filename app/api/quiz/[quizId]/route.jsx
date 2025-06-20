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
        *,
        chapters!inner(
          name,
          subjects!inner(
            name,
            classes!inner(name)
          )
        ),
        questions(*)
      `)
      .eq('id', quizId)
      .single()
    
    if (quizError || !quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }
    
    // Check if student has access to this quiz
    if (session.role === 'student') {
      const { data: user } = await supabase
        .from('auth_users')
        .select('class')
        .eq('id', session.userId)
        .single()
      
      if (user?.class !== quiz.chapters.subjects.classes.name) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
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
          { error: 'You have already attempted this quiz' },
          { status: 409 }
        )
      }
    }
    
    // Remove correct answers from questions for students
    if (session.role === 'student') {
      quiz.questions = quiz.questions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        options: q.options,
        marks: q.marks
      }))
    }
    
    return NextResponse.json({ quiz })
    
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
