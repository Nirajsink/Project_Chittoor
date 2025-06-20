import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get student's class
    const { data: user } = await supabase
      .from('auth_users')
      .select('class')
      .eq('id', session.userId)
      .single()
    
    if (!user?.class) {
      return NextResponse.json({ error: 'Student class not found' }, { status: 404 })
    }
    
    // Get subjects for student's class
    const { data: subjects } = await supabase
      .from('subjects')
      .select(`
        id,
        name,
        classes!inner(name)
      `)
      .eq('classes.name', user.class)
    
    const progressData = await Promise.all(
      subjects.map(async (subject) => {
        // Get chapters for this subject
        const { data: chapters } = await supabase
          .from('chapters')
          .select('id')
          .eq('subject_id', subject.id)
        
        const chapterIds = chapters.map(c => c.id)
        
        // Get content for these chapters
        const { data: contents } = await supabase
          .from('content')
          .select('id')
          .in('chapter_id', chapterIds)
        
        const contentIds = contents.map(c => c.id)
        
        // Get student's content engagement
        const { data: engagement } = await supabase
          .from('content_analytics')
          .select('completion_percentage')
          .eq('user_id', session.userId)
          .in('content_id', contentIds)
        
        // Get quiz attempts for this subject
        const { data: quizzes } = await supabase
          .from('quizzes')
          .select('id')
          .in('chapter_id', chapterIds)
        
        const quizIds = quizzes.map(q => q.id)
        
        const { data: attempts } = await supabase
          .from('student_attempts')
          .select('score, total_marks')
          .eq('student_id', session.userId)
          .in('quiz_id', quizIds)
        
        // Calculate progress metrics
        const totalContent = contentIds.length
        const viewedContent = engagement.length
        const avgCompletion = engagement.length > 0 
          ? engagement.reduce((sum, e) => sum + e.completion_percentage, 0) / engagement.length 
          : 0
        
        const totalQuizzes = quizIds.length
        const attemptedQuizzes = attempts.length
        const avgQuizScore = attempts.length > 0
          ? attempts.reduce((sum, a) => sum + (a.score / a.total_marks * 100), 0) / attempts.length
          : 0
        
        return {
          subject: subject.name,
          contentProgress: {
            total: totalContent,
            viewed: viewedContent,
            percentage: totalContent > 0 ? (viewedContent / totalContent * 100) : 0,
            avgCompletion: Math.round(avgCompletion)
          },
          quizProgress: {
            total: totalQuizzes,
            attempted: attemptedQuizzes,
            percentage: totalQuizzes > 0 ? (attemptedQuizzes / totalQuizzes * 100) : 0,
            avgScore: Math.round(avgQuizScore)
          }
        }
      })
    )
    
    return NextResponse.json({ progress: progressData })
    
  } catch (error) {
    console.error('Student progress error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
