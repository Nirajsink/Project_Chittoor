import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { subjectId, name } = await request.json()
    
    if (!subjectId || !name) {
      return NextResponse.json({ error: 'Subject ID and chapter name are required' }, { status: 400 })
    }
    
    // Verify teacher has access to this subject
    const { data: assignment } = await supabase
      .from('teacher_assignments')
      .select('id')
      .eq('teacher_id', session.userId)
      .eq('subject_id', subjectId)
      .single()
    
    if (!assignment) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    // Get the next order index
    const { data: lastChapter } = await supabase
      .from('chapters')
      .select('order_index')
      .eq('subject_id', subjectId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()
    
    const nextOrderIndex = (lastChapter?.order_index || 0) + 1
    
    // Create new chapter
    const { data: chapter, error } = await supabase
      .from('chapters')
      .insert([{
        name,
        subject_id: subjectId,
        order_index: nextOrderIndex
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating chapter:', error)
      return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      message: 'Chapter created successfully',
      chapter 
    })
    
  } catch (error) {
    console.error('Add chapter API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
