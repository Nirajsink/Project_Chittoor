'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('create-user')
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  
  const [newUser, setNewUser] = useState({
    rollNumber: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    class: ''
  })
  
  const [errors, setErrors] = useState({})
  
  useEffect(() => {
    fetchUser()
    fetchClasses()
    fetchSubjects()
  }, [])
  
  useEffect(() => {
    if (selectedClass && activeTab !== 'create-user') {
      if (activeTab === 'students') {
        fetchStudents(selectedClass.id) // Changed to use ID instead of name
      } else {
        fetchTeachers()
      }
    }
  }, [selectedClass, activeTab])
  
  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setUser(data.user)
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }
  
  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/admin/classes')
      const data = await res.json()
      setClasses(data.classes || [])
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }
  
  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/admin/subjects')
      const data = await res.json()
      setSubjects(data.subjects || [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }
  
  const fetchStudents = async (classId) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/students/${classId}`)
      const data = await res.json()
      setStudents(data.students || [])
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchTeachers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/teachers')
      const data = await res.json()
      setTeachers(data.teachers || [])
    } catch (error) {
      console.error('Error fetching teachers:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!newUser.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll number is required'
    }
    
    if (!newUser.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (!newUser.password) {
      newErrors.password = 'Password is required'
    } else if (newUser.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (newUser.password !== newUser.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (newUser.role === 'student' && !newUser.class) {
      newErrors.class = 'Class is required for students'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleCreateUser = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setCreating(true)
    
    try {
      const res = await fetch('/api/admin/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNumber: newUser.rollNumber,
          fullName: newUser.fullName,
          password: newUser.password,
          role: newUser.role,
          class: newUser.role === 'student' ? newUser.class : null
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert('User created successfully!')
        setNewUser({
          rollNumber: '',
          fullName: '',
          password: '',
          confirmPassword: '',
          role: 'student',
          class: ''
        })
        setErrors({})
      } else {
        alert(data.error || 'Failed to create user')
      }
    } catch (error) {
      alert('Error creating user: ' + error.message)
    } finally {
      setCreating(false)
    }
  }
  
  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      newPassword: ''
    })
  }
  
  const handleSaveUser = async () => {
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser)
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert('User updated successfully!')
        setEditingUser(null)
        if (activeTab === 'students') {
          fetchStudents(selectedClass.id)
        } else {
          fetchTeachers()
        }
      } else {
        alert(data.error || 'Failed to update user')
      }
    } catch (error) {
      alert('Error updating user: ' + error.message)
    }
  }
  
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert('User deleted successfully!')
        if (activeTab === 'students') {
          fetchStudents(selectedClass.id)
        } else {
          fetchTeachers()
        }
      } else {
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      alert('Error deleting user: ' + error.message)
    }
  }
  
  const handleAssignSubject = async (teacherId, subjectId, action) => {
    try {
      const res = await fetch('/api/admin/assign-subject', {
        method: action === 'assign' ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, subjectId })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert(`Subject ${action === 'assign' ? 'assigned' : 'unassigned'} successfully!`)
        fetchTeachers()
      } else {
        alert(data.error || `Failed to ${action} subject`)
      }
    } catch (error) {
      alert(`Error ${action}ing subject: ` + error.message)
    }
  }
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.fullName}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin-dashboard/reports"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <span>📊</span> Reports
            </Link>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('create-user')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'create-user' 
                  ? 'bg-white shadow text-blue-600 font-semibold' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ➕ Create User
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'students' 
                  ? 'bg-white shadow text-blue-600 font-semibold' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              👨‍🎓 Manage Students
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'teachers' 
                  ? 'bg-white shadow text-blue-600 font-semibold' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              👩‍🏫 Manage Teachers
            </button>
          </div>
        </div>
        
        {/* Create User Section */}
        {activeTab === 'create-user' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Create New User</h2>
            
            <form onSubmit={handleCreateUser} className="max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Roll Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    value={newUser.rollNumber}
                    onChange={(e) => setNewUser({...newUser, rollNumber: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.rollNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter roll number"
                  />
                  {errors.rollNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.rollNumber}</p>
                  )}
                </div>
                
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>
                
                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value, class: ''})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                {/* Class (only for students) */}
                {newUser.role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class *
                    </label>
                    <select
                      value={newUser.class}
                      onChange={(e) => setNewUser({...newUser, class: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.class ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                    {errors.class && (
                      <p className="text-red-500 text-xs mt-1">{errors.class}</p>
                    )}
                  </div>
                )}
                
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating User...
                    </>
                  ) : (
                    <>
                      <span>➕</span>
                      Create {newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)}
                    </>
                  )}
                </button>
              </div>
              
              {/* Form Info */}
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">User Creation Guidelines:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Roll numbers must be unique across all users</li>
                  <li>• Passwords must be at least 6 characters long</li>
                  <li>• Students must be assigned to a class</li>
                  <li>• Teachers can be assigned subjects after creation</li>
                </ul>
              </div>
            </form>
          </div>
        )}
        
        {/* Students Management Section */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Students Management</h2>
            
            {/* Class Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Select Class:</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {classes.map(cls => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedClass?.id === cls.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h4 className="font-medium">{cls.name}</h4>
                    <p className="text-sm text-gray-600">{cls.description}</p>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Students Table */}
            {selectedClass && (
              <>
                <h3 className="text-lg font-semibold mb-4">{selectedClass.name} - Students</h3>
                {loading ? (
                  <div className="text-center py-8">Loading students...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll Number</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map(student => (
                          <tr key={student.id}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.roll_number}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.full_name}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.class}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(student.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditUser(student)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(student.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Teachers Management Section */}
        {activeTab === 'teachers' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Teachers Management</h2>
            
            {loading ? (
              <div className="text-center py-8">Loading teachers...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll Number</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Subjects</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teachers.map(teacher => (
                      <tr key={teacher.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {teacher.roll_number}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {teacher.full_name}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="space-y-1">
                            {teacher.assigned_subjects?.map(subject => (
                              <span
                                key={subject.id}
                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1"
                              >
                                {subject.name} (Class {subject.class_id})
                                <button
                                  onClick={() => handleAssignSubject(teacher.id, subject.id, 'unassign')}
                                  className="ml-1 text-red-600 hover:text-red-800"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignSubject(teacher.id, e.target.value, 'assign')
                                  e.target.value = ''
                                }
                              }}
                              className="text-xs border rounded px-2 py-1"
                            >
                              <option value="">+ Assign Subject</option>
                              {subjects
                                .filter(subject => !teacher.assigned_subjects?.find(as => as.id === subject.id))
                                .map(subject => (
                                  <option key={subject.id} value={subject.id}>
                                    {subject.name} (Class {subject.class_id})
                                  </option>
                                ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(teacher.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditUser(teacher)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(teacher.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold mb-4">Edit User</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Roll Number</label>
                  <input
                    type="text"
                    value={editingUser.roll_number}
                    onChange={(e) => setEditingUser({...editingUser, roll_number: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editingUser.full_name}
                    onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                {editingUser.role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Class</label>
                    <select
                      value={editingUser.class || ''}
                      onChange={(e) => setEditingUser({...editingUser, class: e.target.value})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-2">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={editingUser.newPassword || ''}
                    onChange={(e) => setEditingUser({...editingUser, newPassword: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="Enter new password"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveUser}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
