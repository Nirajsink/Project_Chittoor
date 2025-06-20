import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get teacher's assigned subjects
    const { data: assignments } = await supabase
      .from('teacher_assignments')
      .select('subject_id')
      .eq('teacher_id', session.userId)
    
    const subjectIds = assignments.map(a => a.subject_id)
    
    if (subjectIds.length === 0) {
      return NextResponse.json({ 
        totalStudents: 0,
        quizAttempts: 0,
        averageScore: 0
      })
    }
    
    // Get chapters for these subjects
    const { data: chapters } = await supabase
      .from('chapters')
      .select('id')
      .in('subject_id', subjectIds)
    
    const chapterIds = chapters.map(c => c.id)
    
    // Get students from classes that have these subjects
    const { data: subjects } = await supabase
      .from('subjects')
      .select(`
        classes (
          name
        )
      `)
      .in('id', subjectIds)
    
    const classNames = [...new Set(subjects.map(s => s.classes?.name).filter(Boolean))]
    
    let totalStudents = 0
    if (classNames.length > 0) {
      const { count } = await supabase
        .from('auth_users')
        .select('id', { count: 'exact' })
        .eq('role', 'student')
        .in('class', classNames)
      
      totalStudents = count || 0
    }
    
    // Get quiz attempts for teacher's subjects
    let quizAttempts = 0
    let totalScore = 0
    let totalMarks = 0
    
    if (chapterIds.length > 0) {
      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('id')
        .in('chapter_id', chapterIds)
      
      const quizIds = quizzes.map(q => q.id)
      
      if (quizIds.length > 0) {
        const { data: attempts } = await supabase
          .from('student_attempts')
          .select('score, total_marks')
          .in('quiz_id', quizIds)
        
        quizAttempts = attempts.length
        totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0)
        totalMarks = attempts.reduce((sum, attempt) => sum + attempt.total_marks, 0)
      }
    }
    
    const averageScore = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0
    
    return NextResponse.json({
      totalStudents,
      quizAttempts,
      averageScore
    })
    
  } catch (error) {
    console.error('Teacher analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
