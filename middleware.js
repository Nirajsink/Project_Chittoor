import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

async function verifySessionEdge(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

export async function middleware(request) {
  const token = request.cookies.get('session')?.value
  const { pathname } = request.nextUrl
  
  const publicRoutes = ['/', '/login']
  
  if (publicRoutes.includes(pathname)) {
    if (token && pathname === '/login') {
      const session = await verifySessionEdge(token)
      if (session) {
        return NextResponse.redirect(new URL(`/${session.role}-dashboard`, request.url))
      }
    }
    return NextResponse.next()
  }
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  const session = await verifySessionEdge(token)
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (pathname.startsWith('/student-dashboard') && session.role !== 'student') {
    return NextResponse.redirect(new URL(`/${session.role}-dashboard`, request.url))
  }
  
  if (pathname.startsWith('/teacher-dashboard') && session.role !== 'teacher') {
    return NextResponse.redirect(new URL(`/${session.role}-dashboard`, request.url))
  }
  
  if (pathname.startsWith('/admin-dashboard') && session.role !== 'admin') {
    return NextResponse.redirect(new URL(`/${session.role}-dashboard`, request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
