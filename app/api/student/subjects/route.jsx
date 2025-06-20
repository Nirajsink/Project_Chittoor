import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get student's class - remove .single()
    const { data: users } = await supabase
      .from('auth_users')
      .select('class')
      .eq('id', session.userId)
    
    if (!users || users.length === 0 || !users[0]?.class) {
      return NextResponse.json({ subjects: [] })
    }
    
    const userClass = users[0].class
    
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select(`
        id,
        name,
        description,
        classes!inner(name)
      `)
      .eq('classes.name', userClass)
    
    if (error) throw error
    
    return NextResponse.json({ subjects: subjects || [] })
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
