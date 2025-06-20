import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const session = await getSession()
    const { subjectId } = await params
    
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify teacher has access to this subject - remove .single()
    const { data: assignments } = await supabase
      .from('teacher_assignments')
      .select('id')
      .eq('teacher_id', session.userId)
      .eq('subject_id', subjectId)
    
    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    // Get chapters for this subject
    const { data: chapters, error } = await supabase
      .from('chapters')
      .select(`
        id,
        name,
        order_index,
        content (
          id
        )
      `)
      .eq('subject_id', subjectId)
      .order('order_index', { ascending: true })
    
    if (error) {
      console.error('Error fetching chapters:', error)
      return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 })
    }
    
    // Add content count to each chapter
    const chaptersWithCount = chapters?.map(chapter => ({
      id: chapter.id,
      name: chapter.name,
      order_index: chapter.order_index,
      content_count: chapter.content?.length || 0
    })) || []
    
    return NextResponse.json({ chapters: chaptersWithCount })
    
  } catch (error) {
    console.error('Teacher chapters API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
