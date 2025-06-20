import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const session = await getSession()
    const { subjectId } = await params
    
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify teacher has access to this subject
    const { data: assignment } = await supabase
      .from('teacher_assignments')
      .select('id')
      .eq('teacher_id', session.userId)
      .eq('subject_id', subjectId)
      .single()
    
    if (!assignment) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    // Get subject and class info
    const { data: subject } = await supabase
      .from('subjects')
      .select(`
        id,
        name,
        classes(id, name)
      `)
      .eq('id', subjectId)
      .single()
    
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }
    
    // Get all students in this class
    const { data: students } = await supabase
      .from('auth_users')
      .select('id, roll_number, full_name, class')
      .eq('role', 'student')
      .eq('class', subject.classes.name)
      .order('roll_number')
    
    if (!students || students.length === 0) {
      return NextResponse.json({ 
        progressData: [], 
        classInfo: subject.classes 
      })
    }
    
    // Get chapters for this subject
    const { data: chapters } = await supabase
      .from('chapters')
      .select('id')
      .eq('subject_id', subjectId)
    
    const chapterIds = chapters?.map(c => c.id) || []
    
    // Get total content count
    let totalContent = 0
    if (chapterIds.length > 0) {
      const { count } = await supabase
        .from('content')
        .select('id', { count: 'exact' })
        .in('chapter_id', chapterIds)
        .neq('type', 'quiz')
      
      totalContent = count || 0
    }
    
    // Get total quizzes count
    let totalQuizzes = 0
    if (chapterIds.length > 0) {
      const { count } = await supabase
        .from('quizzes')
        .select('id', { count: 'exact' })
        .in('chapter_id', chapterIds)
      
      totalQuizzes = count || 0
    }
    
    // Process each student's progress
    const progressData = await Promise.all(
      students.map(async (student) => {
        // Get content engagement
        let contentViewed = 0
        if (chapterIds.length > 0) {
          const { data: contentAnalytics } = await supabase
            .from('content_analytics')
            .select(`
              content_id,
              content!inner(chapter_id)
            `)
            .eq('user_id', student.id)
            .in('content.chapter_id', chapterIds)
          
          contentViewed = contentAnalytics?.length || 0
        }
        
        // Get quiz attempts
        let quizzesAttempted = 0
        let totalQuizScore = 0
        let totalQuizMarks = 0
        
        if (chapterIds.length > 0) {
          const { data: quizAttempts } = await supabase
            .from('student_attempts')
            .select(`
              score,
              total_marks,
              quizzes!inner(chapter_id)
            `)
            .eq('student_id', student.id)
            .in('quizzes.chapter_id', chapterIds)
          
          quizzesAttempted = quizAttempts?.length || 0
          totalQuizScore = quizAttempts?.reduce((sum, attempt) => sum + attempt.score, 0) || 0
          totalQuizMarks = quizAttempts?.reduce((sum, attempt) => sum + attempt.total_marks, 0) || 0
        }
        
        // Calculate percentages
        const contentProgress = totalContent > 0 ? Math.round((contentViewed / totalContent) * 100) : 0
        const quizProgress = totalQuizzes > 0 ? Math.round((quizzesAttempted / totalQuizzes) * 100) : 0
        const avgQuizScore = totalQuizMarks > 0 ? Math.round((totalQuizScore / totalQuizMarks) * 100) : 0
        const overallProgress = Math.round((contentProgress + quizProgress) / 2)
        
        return {
          roll_number: student.roll_number,
          full_name: student.full_name,
          class: student.class,
          total_content: totalContent,
          content_viewed: contentViewed,
          content_progress: contentProgress,
          total_quizzes: totalQuizzes,
          quizzes_attempted: quizzesAttempted,
          quiz_progress: quizProgress,
          avg_quiz_score: avgQuizScore,
          overall_progress: overallProgress
        }
      })
    )
    
    return NextResponse.json({
      progressData,
      classInfo: subject.classes
    })
    
  } catch (error) {
    console.error('Error fetching student progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
