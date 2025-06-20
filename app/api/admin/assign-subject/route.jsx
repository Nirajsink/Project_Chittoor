import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { teacherId, subjectId } = await request.json()
    
    const { error } = await supabase
      .from('teacher_assignments')
      .insert([{ teacher_id: teacherId, subject_id: subjectId }])
    
    if (error) throw error
    
    return NextResponse.json({ message: 'Subject assigned successfully' })
    
  } catch (error) {
    console.error('Error assigning subject:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { teacherId, subjectId } = await request.json()
    
    const { error } = await supabase
      .from('teacher_assignments')
      .delete()
      .eq('teacher_id', teacherId)
      .eq('subject_id', subjectId)
    
    if (error) throw error
    
    return NextResponse.json({ message: 'Subject unassigned successfully' })
    
  } catch (error) {
    console.error('Error unassigning subject:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
