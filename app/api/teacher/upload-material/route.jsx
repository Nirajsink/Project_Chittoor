import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file')
    const title = formData.get('title')
    const chapterId = formData.get('chapterId')
    const type = formData.get('type')
    
    if (!file || !title || !chapterId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Verify teacher has access to this chapter
    const { data: chapter } = await supabase
      .from('chapters')
      .select(`
        id,
        subjects!inner(
          teacher_assignments!inner(teacher_id)
        )
      `)
      .eq('id', chapterId)
      .eq('subjects.teacher_assignments.teacher_id', session.userId)
      .single()
    
    if (!chapter) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`
    const filePath = `materials/${chapterId}/${fileName}`
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('course-materials')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'File upload failed' }, { status: 500 })
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('course-materials')
      .getPublicUrl(filePath)
    
    // Save content record to database
    const { data: content, error: dbError } = await supabase
      .from('content')
      .insert([{
        chapter_id: chapterId,
        title,
        type,
        file_url: urlData.publicUrl
      }])
      .select()
      .single()
    
    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save content record' }, { status: 500 })
    }
    
    return NextResponse.json({
      message: 'Material uploaded successfully',
      content
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
