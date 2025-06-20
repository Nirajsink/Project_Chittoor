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
    
    const { data: chapters, error } = await supabase
      .from('chapters')
      .select(`
        *,
        content(count)
      `)
      .eq('subject_id', subjectId)
      .order('order_index')
    
    if (error) throw error
    
    // Add content count to each chapter
    const chaptersWithCount = chapters.map(chapter => ({
      ...chapter,
      content_count: chapter.content?.length || 0
    }))
    
    return NextResponse.json({ chapters: chaptersWithCount })
  } catch (error) {
    console.error('Error fetching chapters:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
