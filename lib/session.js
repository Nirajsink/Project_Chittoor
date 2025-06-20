import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export function createSession(user) {
  try {
    const token = jwt.sign(
      { 
        userId: user.id, 
        rollNumber: user.roll_number, 
        role: user.role,
        fullName: user.full_name,
        class: user.class
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    return token
  } catch (error) {
    return null
  }
}

export function verifySession(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    
    if (!token) return null
    
    return verifySession(token)
  } catch (error) {
    return null
  }
}
