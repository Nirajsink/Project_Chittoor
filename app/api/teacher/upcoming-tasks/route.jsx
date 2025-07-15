// app/api/teacher/upcoming-tasks/route.js

// This is a mock API route. In a real application, you would
// fetch upcoming tasks/deadlines from your database that are
// assigned to or relevant for the authenticated teacher.

export async function GET(request) {
  try {
    const tasks = [
      { title: 'Grade Physics Assignments', dueDate: 'Today', priority: 'High', class: 'Class 12A' },
      { title: 'Prepare Chemistry Lab', dueDate: 'Tomorrow', priority: 'Medium', class: 'Class 11B' },
      { title: 'Update Mathematics Syllabus', dueDate: 'Nov 8', priority: 'Low', class: 'Class 10C' },
      { title: 'Review Biology Chapter 5 Quiz', dueDate: 'Nov 12', priority: 'Medium', class: 'Class 11A' },
    ];

    return new Response(JSON.stringify({ tasks }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching upcoming tasks:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch upcoming tasks' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
