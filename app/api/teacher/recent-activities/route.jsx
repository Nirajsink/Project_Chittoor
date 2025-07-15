// app/api/teacher/recent-activities/route.js

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

    // --- 2. Fetch Recent Activities from user_activities table ---
    // We'll fetch activities performed by this teacher.
    // You might need to refine 'activity_type' and 'resource_type' based on your logging.
    // For example, 'material_uploaded', 'quiz_created', 'lesson_conducted'.
    // We'll also try to fetch related resource titles if possible (e.g., content title, quiz title).

    const { data: activities, error: activitiesError } = await supabase
      .from('user_activities')
      .select(`
        id,
        activity_type,
        resource_id,
        resource_type,
        metadata,
        created_at,
        content (title), // Attempt to join with content table if resource_type is 'content'
        quizzes (title)  // Attempt to join with quizzes table if resource_type is 'quiz'
      `)
      .eq('user_id', teacherId)
      .order('created_at', { ascending: false }) // Order by most recent
      .limit(5); // Limit to a reasonable number of recent activities

    if (activitiesError) {
      console.error('Error fetching recent activities:', activitiesError.message);
      throw new Error('Failed to fetch recent activities');
    }

    // --- 3. Format Activities for Frontend ---
    const formattedActivities = activities.map(activity => {
      let title = activity.activity_type; // Default title
      let type = activity.activity_type;
      let relatedClass = 'N/A'; // Placeholder for class info

      // Determine title and type based on resource_type and available joins
      if (activity.resource_type === 'content' && activity.content) {
        title = `Uploaded: ${activity.content.title}`;
        type = activity.activity_type === 'upload' ? 'upload' : 'document'; // Or 'video'/'ppt' based on content.type
      } else if (activity.resource_type === 'quiz' && activity.quizzes) {
        title = `Created Quiz: ${activity.quizzes.title}`;
        type = 'quiz';
      } else {
        // Fallback for other activity types or if joins fail
        if (activity.activity_type === 'grade') {
          title = `Graded Assignment`; // Refine with metadata if possible
        } else if (activity.activity_type === 'login') {
          title = `User Login`;
        }
      }

      // Try to get class info from metadata or by joining (more complex, might need a separate query or pre-join in DB view)
      // For now, if class info is in metadata, use it.
      if (activity.metadata && activity.metadata.class_name) {
        relatedClass = activity.metadata.class_name;
      } else if (activity.metadata && activity.metadata.classId) {
         // If you store classId in metadata, you'd need another query to get the name
         // For simplicity, we'll keep it as N/A or derive from a separate query if needed.
      }


      return {
        id: activity.id,
        type: type,
        title: title,
        time: new Date(activity.created_at).toLocaleString(), // Format date nicely
        class: relatedClass, // This might require more complex joins or metadata
      };
    });

    return NextResponse.json({ activities: formattedActivities }, { status: 200 });
  } catch (error) {
    console.error('Error in recent activities API:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch recent activities' }, { status: 500 });
  }
}
