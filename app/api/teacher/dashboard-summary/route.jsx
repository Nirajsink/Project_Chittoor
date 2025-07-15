// app/api/teacher/dashboard-summary/route.js

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session'; // Assuming getSession helps retrieve authenticated user
import { supabase } from '@/lib/supabase';   // Supabase client instance

export async function GET(request) {
  try {
    // --- 1. Authenticate and Get Teacher ID ---
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const teacherId = session.user.id; // Assuming session.user.id is the UUID from auth_users

    // --- 2. Get Subjects assigned to this Teacher ---
    const { data: assignedSubjects, error: assignedSubjectsError } = await supabase
      .from('teacher_assignments')
      .select('subject_id')
      .eq('teacher_id', teacherId);

    if (assignedSubjectsError) {
      console.error('Error fetching assigned subjects:', assignedSubjectsError.message);
      throw new Error('Failed to fetch assigned subjects');
    }

    const teacherSubjectIds = assignedSubjects.map(assignment => assignment.subject_id);

    // If no subjects are assigned, return zero counts
    if (teacherSubjectIds.length === 0) {
      return NextResponse.json({
        totalStudents: 0,
        activeClasses: 0,
        avgPerformance: 'N/A',
        teachingHours: '0h',
      }, { status: 200 });
    }

    // --- 3. Get Classes associated with these Subjects ---
    const { data: classesForSubjects, error: classesForSubjectsError } = await supabase
      .from('subjects')
      .select('class_id')
      .in('id', teacherSubjectIds);

    if (classesForSubjectsError) {
      console.error('Error fetching classes for subjects:', classesForSubjectsError.message);
      throw new Error('Failed to fetch classes for subjects');
    }

    const classIds = [...new Set(classesForSubjects.map(s => s.class_id))]; // Get unique class_ids

    // If no classes are associated, return zero counts
    if (classIds.length === 0) {
      return NextResponse.json({
        totalStudents: 0,
        activeClasses: 0,
        avgPerformance: 'N/A',
        teachingHours: '0h',
      }, { status: 200 });
    }

    // --- 4. Fetch Total Students for these Classes ---
    // Assuming 'auth_users.class' directly corresponds to 'classes.name'
    // This requires fetching class names first.
    const { data: classNamesData, error: classNamesError } = await supabase
      .from('classes')
      .select('name')
      .in('id', classIds);

    if (classNamesError) {
      console.error('Error fetching class names:', classNamesError.message);
      throw new Error('Failed to fetch class names');
    }
    const classNames = classNamesData.map(c => c.name);

    const { count: totalStudents, error: studentsError } = await supabase
      .from('auth_users')
      .select('id', { count: 'exact' })
      .eq('role', 'student')
      .in('class', classNames); // Filter students by class name

    if (studentsError) {
      console.error('Error fetching total students:', studentsError.message);
      throw new Error('Failed to fetch total students');
    }

    // --- 5. Count Active Classes ---
    // 'activeClasses' is simply the count of unique classes found for the teacher's subjects.
    const activeClassesCount = classIds.length;

    // --- 6. Calculate Average Performance (Avg Quiz Score) ---
    // Join student_attempts with quizzes and chapters to filter by teacher's subjects/classes.
    // This is a more complex query. We'll fetch attempts for quizzes associated with the teacher's subjects.
    const { data: quizAttempts, error: quizAttemptsError } = await supabase
      .from('student_attempts')
      .select(`
        score,
        total_marks,
        quizzes (
          id,
          chapter_id,
          chapters (
            id,
            subject_id
          )
        )
      `)
      .in('quizzes.chapters.subject_id', teacherSubjectIds); // Filter by subjects assigned to teacher

    if (quizAttemptsError) {
      console.error('Error fetching quiz attempts:', quizAttemptsError.message);
      throw new Error('Failed to fetch quiz attempts for average performance');
    }

    let totalScoreSum = 0;
    let totalPossibleMarks = 0;
    quizAttempts.forEach(attempt => {
      totalScoreSum += attempt.score;
      totalPossibleMarks += attempt.total_marks;
    });

    const avgPerformance = totalPossibleMarks > 0
      ? `${((totalScoreSum / totalPossibleMarks) * 100).toFixed(0)}%`
      : 'N/A';

    // --- 7. Calculate Teaching Hours ---
    // Assuming 'user_activities' logs teaching-related activities by the teacher.
    // You need to define what 'teaching' activity types are (e.g., 'lesson_conducted', 'material_uploaded').
    // Also, 'duration' in user_activities is an integer, assuming it's in minutes.
    const { data: teachingActivities, error: teachingActivitiesError } = await supabase
      .from('user_activities')
      .select('duration')
      .eq('user_id', teacherId)
      .in('activity_type', ['lesson_conducted', 'material_preparation', 'online_class']); // Define your teaching activity types

    if (teachingActivitiesError) {
      console.error('Error fetching teaching activities:', teachingActivitiesError.message);
      throw new Error('Failed to fetch teaching activities');
    }

    let totalMinutes = 0;
    teachingActivities.forEach(activity => {
      totalMinutes += activity.duration || 0; // Sum duration, default to 0 if null
    });
    const teachingHours = `${(totalMinutes / 60).toFixed(0)}h`; // Convert minutes to hours

    const summaryData = {
      totalStudents: totalStudents,
      activeClasses: activeClassesCount,
      avgPerformance: avgPerformance,
      teachingHours: teachingHours,
    };

    return NextResponse.json(summaryData, { status: 200 });
  } catch (error) {
    console.error('Error in dashboard summary API:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard summary' }, { status: 500 });
  }
}
