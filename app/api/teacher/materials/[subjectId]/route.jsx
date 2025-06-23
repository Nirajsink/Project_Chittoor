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
    
    // Get chapters for this subject
    const { data: chapters } = await supabase
      .from('chapters')
      .select('id')
      .eq('subject_id', parseInt(subjectId))
    
    const chapterIds = chapters?.map(c => c.id) || []
    
    if (chapterIds.length === 0) {
      return NextResponse.json({ materials: [] })
    }
    
    // Get materials for these chapters
    const { data: materials, error } = await supabase
      .from('content')
      .select(`
        id,
        title,
        type,
        file_url,
        chapter_id,
        created_at,
        chapters(name)
      `)
      .in('chapter_id', chapterIds)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ materials: materials || [] })
    
  } catch (error) {
    console.error('Error fetching materials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
