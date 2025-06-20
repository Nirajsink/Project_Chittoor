import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { hashPassword } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { rollNumber, fullName, password, role, class: userClass } = await request.json()
    
    // Validate required fields
    if (!rollNumber || !fullName || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }
    
    // Validate class for students
    if (role === 'student' && !userClass) {
      return NextResponse.json({ error: 'Class is required for students' }, { status: 400 })
    }
    
    // Check if roll number already exists
    const { data: existingUser } = await supabase
      .from('auth_users')
      .select('id')
      .eq('roll_number', rollNumber)
      .single()
    
    if (existingUser) {
      return NextResponse.json({ error: 'Roll number already exists' }, { status: 409 })
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password)
    
    // Create user
    const { data: user, error } = await supabase
      .from('auth_users')
      .insert([{
        roll_number: rollNumber,
        password: hashedPassword,
        full_name: fullName,
        role,
        class: role === 'student' ? userClass : null
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }
    
    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        rollNumber: user.roll_number,
        fullName: user.full_name,
        role: user.role,
        class: user.class
      }
    })
    
  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
