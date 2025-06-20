import { NextResponse } from 'next/server'
import { getUserByRollNumber, verifyPassword } from '@/lib/auth'
import { createSession } from '@/lib/session'

export async function POST(request) {
  try {
    const { rollNumber, password } = await request.json()
    
    if (!rollNumber || !password) {
      return NextResponse.json(
        { error: 'Roll number and password are required' },
        { status: 400 }
      )
    }
    
    const user = await getUserByRollNumber(rollNumber)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    const token = createSession(user)
    if (!token) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }
    
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        rollNumber: user.roll_number,
        fullName: user.full_name,
        role: user.role,
        class: user.class
      }
    })
    
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })
    
    return response
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
