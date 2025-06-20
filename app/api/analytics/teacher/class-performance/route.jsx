import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get subjects taught by this teacher
    const { data: assignments } = await supabase
      .from('teacher_assignments')
      .select(`
        subjects(
          id,
          name,
          classes(name)
        )
      `)
      .eq('teacher_id', session.userId)
    
    const performanceData = await Promise.all(
      assignments.map(async (assignment) => {
        const subject = assignment.subjects
        const className = subject.classes.name
        
        // Get students in this class
        const { data: students } = await supabase
          .from('auth_users')
          .select('id, full_name')
          .eq('role', 'student')
          .eq('class', className)
        
        // Get chapters for this subject
        const { data: chapters } = await supabase
          .from('chapters')
          .select('id, name')
          .eq('subject_id', subject.id)
        
        const chapterIds = chapters.map(c => c.id)
        
        // Get quizzes for these chapters
        const { data: quizzes } = await supabase
          .from('quizzes')
          .select('id, title, total_questions')
          .in('chapter_id', chapterIds)
        
        const quizIds = quizzes.map(q => q.id)
        
        // Get all quiz attempts for this subject
        const { data: attempts } = await supabase
          .from('student_attempts')
          .select(`
            student_id,
            quiz_id,
            score,
            total_marks,
            completed_at,
            auth_users(full_name)
          `)
          .in('quiz_id', quizIds)
        
        // Calculate class performance metrics
        const totalStudents = students.length
        const activeStudents = new Set(attempts.map(a => a.student_id)).size
        const totalAttempts = attempts.length
        const avgScore = attempts.length > 0
          ? attempts.reduce((sum, a) => sum + (a.score / a.total_marks * 100), 0) / attempts.length
          : 0
        
        // Get content engagement
        const { data: contents } = await supabase
          .from('content')
          .select('id')
          .in('chapter_id', chapterIds)
        
        const contentIds = contents.map(c => c.id)
        
        const { data: contentEngagement } = await supabase
          .from('content_analytics')
          .select('user_id, view_count, total_time_spent')
          .in('content_id', contentIds)
        
        const avgContentViews = contentEngagement.length > 0
          ? contentEngagement.reduce((sum, e) => sum + e.view_count, 0) / contentEngagement.length
          : 0
        
        const avgTimeSpent = contentEngagement.length > 0
          ? contentEngagement.reduce((sum, e) => sum + e.total_time_spent, 0) / contentEngagement.length
          : 0
        
        return {
          subject: subject.name,
          class: className,
          metrics: {
            totalStudents,
            activeStudents,
            engagementRate: totalStudents > 0 ? (activeStudents / totalStudents * 100) : 0,
            totalQuizAttempts: totalAttempts,
            avgQuizScore: Math.round(avgScore),
            avgContentViews: Math.round(avgContentViews),
            avgTimeSpent: Math.round(avgTimeSpent / 60) // Convert to minutes
          },
          topPerformers: attempts
            .sort((a, b) => (b.score / b.total_marks) - (a.score / a.total_marks))
            .slice(0, 5)
            .map(a => ({
              name: a.auth_users.full_name,
              score: Math.round((a.score / a.total_marks) * 100)
            }))
        }
      })
    )
    
    return NextResponse.json({ performance: performanceData })
    
  } catch (error) {
    console.error('Teacher performance analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
