import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .order('name')
    
    if (error) throw error
    
    return NextResponse.json({ classes })
    
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
