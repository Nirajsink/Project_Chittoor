import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const session = await getSession()
    const { chapterId } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify user has access to this chapter
    let accessQuery = supabase
      .from('chapters')
      .select(`
        id,
        subjects!inner(
          id,
          classes!inner(name)
        )
      `)
      .eq('id', chapterId)
    
    if (session.role === 'student') {
      // Students can only access chapters from their class
      const { data: user } = await supabase
        .from('auth_users')
        .select('class')
        .eq('id', session.userId)
        .single()
      
      if (!user?.class) {
        return NextResponse.json({ error: 'Student class not found' }, { status: 403 })
      }
      
      accessQuery = accessQuery.eq('subjects.classes.name', user.class)
    } else if (session.role === 'teacher') {
      // Teachers can only access chapters from subjects they teach
      accessQuery = accessQuery.eq('subjects.teacher_assignments.teacher_id', session.userId)
    }
    // Admins have access to all chapters
    
    const { data: chapter } = await accessQuery.single()
    
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found or access denied' },
        { status: 403 }
      )
    }
    
    // Fetch content for this chapter
    const { data: contents, error } = await supabase
      .from('content')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ contents })
    
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
