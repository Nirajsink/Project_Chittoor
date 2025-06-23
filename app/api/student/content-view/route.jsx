import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Use the custom view to get all content for this student
    const { data: content, error } = await supabase
      .from('student_content_view')
      .select('*')
      .eq('roll_number', session.rollNumber)
      .order('subject_name', { ascending: true })
      .order('chapter_name', { ascending: true })
    
    if (error) {
      console.error('Error fetching student content:', error)
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
    }
    
    return NextResponse.json({ content: content || [] })
    
  } catch (error) {
    console.error('Student content view API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
