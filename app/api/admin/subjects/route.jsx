import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select(`
        id,
        name,
        description,
        class_id,
        classes(id, name)
      `)
      .order('name')
    
    if (error) throw error
    
    const formattedSubjects = subjects?.map(subject => ({
      ...subject,
      class_name: subject.classes?.name
    })) || []
    
    return NextResponse.json({ subjects: formattedSubjects })
    
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
