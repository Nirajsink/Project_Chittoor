import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: teachers, error } = await supabase
      .from('auth_users')
      .select(`
        id,
        roll_number,
        full_name,
        created_at,
        teacher_assignments(
          subjects(
            id,
            name,
            classes(name)
          )
        )
      `)
      .eq('role', 'teacher')
      .order('roll_number')
    
    if (error) throw error
    
    const formattedTeachers = teachers.map(teacher => ({
      ...teacher,
      assigned_subjects: teacher.teacher_assignments?.map(assignment => ({
        id: assignment.subjects.id,
        name: assignment.subjects.name,
        class_name: assignment.subjects.classes?.name
      })) || []
    }))
    
    return NextResponse.json({ teachers: formattedTeachers })
    
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
