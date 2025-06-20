import { supabase } from './supabase'

// Track user activity
export async function trackActivity(userId, activityType, resourceId = null, resourceType = null, metadata = {}, duration = null) {
  try {
    const { error } = await supabase
      .from('user_activities')
      .insert([{
        user_id: userId,
        activity_type: activityType,
        resource_id: resourceId,
        resource_type: resourceType,
        metadata,
        duration
      }])
    
    if (error) console.error('Analytics tracking error:', error)
  } catch (error) {
    console.error('Analytics tracking error:', error)
  }
}

// Track content engagement
export async function trackContentEngagement(contentId, userId, timeSpent = 0, completionPercentage = 0) {
  try {
    const { data: existing } = await supabase
      .from('content_analytics')
      .select('*')
      .eq('content_id', contentId)
      .eq('user_id', userId)
      .single()
    
    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('content_analytics')
        .update({
          view_count: existing.view_count + 1,
          total_time_spent: existing.total_time_spent + timeSpent,
          completion_percentage: Math.max(existing.completion_percentage, completionPercentage),
          last_accessed: new Date().toISOString()
        })
        .eq('id', existing.id)
      
      if (error) console.error('Content analytics update error:', error)
    } else {
      // Create new record
      const { error } = await supabase
        .from('content_analytics')
        .insert([{
          content_id: contentId,
          user_id: userId,
          view_count: 1,
          total_time_spent: timeSpent,
          completion_percentage: completionPercentage
        }])
      
      if (error) console.error('Content analytics insert error:', error)
    }
  } catch (error) {
    console.error('Content engagement tracking error:', error)
  }
}

// Update quiz analytics after attempt
export async function updateQuizAnalytics(quizId) {
  try {
    // Get all attempts for this quiz
    const { data: attempts } = await supabase
      .from('student_attempts')
      .select('score, total_marks')
      .eq('quiz_id', quizId)
    
    if (!attempts || attempts.length === 0) return
    
    const totalAttempts = attempts.length
    const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0)
    const totalPossible = attempts.reduce((sum, attempt) => sum + attempt.total_marks, 0)
    const averageScore = totalScore / totalAttempts
    const passCount = attempts.filter(attempt => (attempt.score / attempt.total_marks) >= 0.6).length
    const passRate = (passCount / totalAttempts) * 100
    
    // Update or insert quiz analytics
    const { error } = await supabase
      .from('quiz_analytics')
      .upsert([{
        quiz_id: quizId,
        total_attempts: totalAttempts,
        average_score: averageScore,
        pass_rate: passRate,
        last_updated: new Date().toISOString()
      }])
    
    if (error) console.error('Quiz analytics update error:', error)
  } catch (error) {
    console.error('Quiz analytics error:', error)
  }
}

// Update daily metrics
export async function updateDailyMetrics() {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Get today's metrics
    const [activeUsers, newRegistrations, totalLogins, contentViews, quizAttempts] = await Promise.all([
      // Active users today
      supabase
        .from('user_activities')
        .select('user_id', { count: 'exact' })
        .gte('created_at', `${today}T00:00:00Z`)
        .lt('created_at', `${today}T23:59:59Z`),
      
      // New registrations today
      supabase
        .from('auth_users')
        .select('id', { count: 'exact' })
        .gte('created_at', `${today}T00:00:00Z`)
        .lt('created_at', `${today}T23:59:59Z`),
      
      // Total logins today
      supabase
        .from('user_activities')
        .select('id', { count: 'exact' })
        .eq('activity_type', 'login')
        .gte('created_at', `${today}T00:00:00Z`)
        .lt('created_at', `${today}T23:59:59Z`),
      
      // Content views today
      supabase
        .from('user_activities')
        .select('id', { count: 'exact' })
        .eq('activity_type', 'content_view')
        .gte('created_at', `${today}T00:00:00Z`)
        .lt('created_at', `${today}T23:59:59Z`),
      
      // Quiz attempts today
      supabase
        .from('student_attempts')
        .select('id', { count: 'exact' })
        .gte('completed_at', `${today}T00:00:00Z`)
        .lt('completed_at', `${today}T23:59:59Z`)
    ])
    
    // Upsert daily metrics
    const { error } = await supabase
      .from('daily_metrics')
      .upsert([{
        date: today,
        active_users: activeUsers.count || 0,
        new_registrations: newRegistrations.count || 0,
        total_logins: totalLogins.count || 0,
        content_views: contentViews.count || 0,
        quiz_attempts: quizAttempts.count || 0
      }])
    
    if (error) console.error('Daily metrics update error:', error)
  } catch (error) {
    console.error('Daily metrics error:', error)
  }
}
