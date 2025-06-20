import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const session = await getSession()
    const { className } = await params
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: students, error } = await supabase
      .from('auth_users')
      .select('id, roll_number, full_name, class, created_at')
      .eq('role', 'student')
      .eq('class', decodeURIComponent(className))
      .order('roll_number')
    
    if (error) throw error
    
    return NextResponse.json({ students })
    
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
