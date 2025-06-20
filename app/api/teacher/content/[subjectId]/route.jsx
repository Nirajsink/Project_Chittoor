import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const session = await getSession()
    const { subjectId } = await params
    
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // For now, return empty array to test the connection
    return NextResponse.json({ contents: [] })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
