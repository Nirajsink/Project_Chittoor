import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contentId, timeSpent } = await request.json()

    if (!contentId || !timeSpent) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Check if record exists
    const { data: existing, error: selectError } = await supabase
      .from('content_analytics')
      .select('*')
      .eq('content_id', contentId)
      .eq('user_id', session.userId)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('content_analytics')
        .update({
          view_count: existing.view_count + 1,
          total_time_spent: existing.total_time_spent + timeSpent,
          last_accessed: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update analytics' }, { status: 500 })
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('content_analytics')
        .insert({
          content_id: contentId,
          user_id: session.userId,
          view_count: 1,
          total_time_spent: timeSpent,
          last_accessed: new Date().toISOString(),
          completion_percentage: 0
        })

      if (insertError) {
        return NextResponse.json({ error: 'Failed to insert analytics' }, { status: 500 })
      }
    }

    return NextResponse.json({ message: 'Analytics recorded' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
