import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { uploadFile, generateFileName, validateFile } from '@/lib/storage'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file')
    const chapterId = formData.get('chapterId')
    const title = formData.get('title')
    const contentType = formData.get('type') // 'pdf', 'video', 'note'
    
    if (!file || !chapterId || !title || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate file based on content type
    let allowedTypes = []
    let maxSize = 10 // Default 10MB
    
    switch (contentType) {
      case 'pdf':
        allowedTypes = ['application/pdf']
        maxSize = 50 // 50MB for PDFs
        break
      case 'video':
        allowedTypes = ['video/mp4', 'video/webm', 'video/ogg']
        maxSize = 500 // 500MB for videos
        break
      case 'note':
        allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        maxSize = 25 // 25MB for notes
        break
      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }
    
    // Validate file
    validateFile(file, allowedTypes, maxSize)
    
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
    
    // Generate unique filename and upload
    const fileName = generateFileName(file.name)
    const filePath = `${contentType}s/${chapterId}/${fileName}`
    
    const uploadResult = await uploadFile(file, 'course-materials', filePath)
    
    // Save content record to database
    const { data: content, error: dbError } = await supabase
      .from('content')
      .insert([{
        chapter_id: chapterId,
        title,
        type: contentType,
        file_url: uploadResult.path
      }])
      .select()
      .single()
    
    if (dbError) throw dbError
    
    return NextResponse.json({
      message: 'Content uploaded successfully',
      content
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
