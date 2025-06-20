import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { chapterId, title, type, timeLimit, questions } = await request.json()
    
    if (!chapterId || !title || !type || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate quiz type
    if (!['chapter', 'annual'].includes(type)) {
      return NextResponse.json({ error: 'Invalid quiz type' }, { status: 400 })
    }
    
    // Verify teacher has access to this chapter
    const { data: chapter } = await supabase
      .from('chapters')
      .select(`
        id,
        subjects!inner(
          id,
          teacher_assignments!inner(teacher_id)
        )
      `)
      .eq('id', chapterId)
      .eq('subjects.teacher_assignments.teacher_id', session.userId)
      .single()
    
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found or access denied' },
        { status: 403 }
      )
    }
    
    // Create quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([{
        chapter_id: chapterId,
        title,
        type,
        total_questions: questions.length,
        time_limit: timeLimit || 30
      }])
      .select()
      .single()
    
    if (quizError) throw quizError
    
    // Create questions
    const questionsData = questions.map(q => ({
      quiz_id: quiz.id,
      question_text: q.questionText,
      options: q.options,
      correct_answer: q.correctAnswer,
      marks: q.marks || 1
    }))
    
    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsData)
    
    if (questionsError) throw questionsError
    
    return NextResponse.json({
      message: 'Quiz created successfully',
      quiz
    })
    
  } catch (error) {
    console.error('Quiz creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    )
  }
}
