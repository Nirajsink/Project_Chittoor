import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { chapterId, title, videoUrl } = await request.json()
    
    if (!chapterId || !title || !videoUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate video URL (basic validation)
    const videoUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)/
    if (!videoUrlPattern.test(videoUrl)) {
      return NextResponse.json(
        { error: 'Invalid video URL. Only YouTube and Vimeo links are supported.' },
        { status: 400 }
      )
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
    
    // Save video link to database
    const { data: content, error } = await supabase
      .from('content')
      .insert([{
        chapter_id: chapterId,
        title,
        type: 'video',
        file_url: videoUrl
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      message: 'Video link added successfully',
      content
    })
    
  } catch (error) {
    console.error('Video link error:', error)
    return NextResponse.json(
      { error: 'Failed to add video link' },
      { status: 500 }
    )
  }
}
