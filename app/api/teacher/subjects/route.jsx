import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Disable RLS temporarily for testing
    const { data: assignments, error } = await supabase
      .from('teacher_assignments')
      .select(`
        subjects (
          id,
          name,
          description,
          classes (
            name
          )
        )
      `)
      .eq('teacher_id', session.userId)
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 })
    }
    
    const subjects = assignments?.map(assignment => ({
      id: assignment.subjects.id,
      name: assignment.subjects.name,
      description: assignment.subjects.description,
      class_name: assignment.subjects.classes?.name
    })) || []
    
    return NextResponse.json({ subjects })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
