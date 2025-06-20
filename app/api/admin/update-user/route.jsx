import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { hashPassword } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function PUT(request) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id, roll_number, full_name, class: userClass, newPassword } = await request.json()
    
    const updateData = {
      roll_number,
      full_name,
      class: userClass
    }
    
    // Hash new password if provided
    if (newPassword && newPassword.trim()) {
      updateData.password = await hashPassword(newPassword)
    }
    
    const { error } = await supabase
      .from('auth_users')
      .update(updateData)
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ message: 'User updated successfully' })
    
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
