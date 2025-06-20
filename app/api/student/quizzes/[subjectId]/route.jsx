import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const session = await getSession()
    const { subjectId } = await params
    
    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get student's class
    const { data: users } = await supabase
      .from('auth_users')
      .select('class')
      .eq('id', session.userId)
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }
    
    const userClass = users[0].class
    
    // Verify subject belongs to student's class
    const { data: subjects } = await supabase
      .from('subjects')
      .select(`
        id,
        classes!inner(name)
      `)
      .eq('id', subjectId)
      .eq('classes.name', userClass)
    
    if (!subjects || subjects.length === 0) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }
    
    // Get chapters for this subject
    const { data: chapters } = await supabase
      .from('chapters')
      .select('id')
      .eq('subject_id', subjectId)
    
    const chapterIds = chapters?.map(c => c.id) || []
    
    if (chapterIds.length === 0) {
      return NextResponse.json({ quizzes: [] })
    }
    
    // Get quizzes for these chapters
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select(`
        id,
        title,
        total_questions,
        time_limit,
        chapter_id,
        created_at,
        chapters(name)
      `)
      .in('chapter_id', chapterIds)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ quizzes: quizzes || [] })
    
  } catch (error) {
    console.error('Error fetching student quizzes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
