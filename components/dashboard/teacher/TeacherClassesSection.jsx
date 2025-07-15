import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button"; // Ensure this path is correct
import { Plus, BarChart3, Settings, MoreVertical, Upload, Eye, BookOpen, Video, Trophy, FileText } from 'lucide-react';

// Helper function for Tailwind class mapping
const getColorClasses = (color) => {
  const classes = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    // Add other colors as needed for your classes
  };
  return classes[color] || { bg: 'bg-gray-100', text: 'text-gray-600' };
};

// Helper for content icons (re-used for consistency)
const getContentIcon = (type) => {
  switch (type) {
    case 'textbook':
    case 'document':
      return <BookOpen className="w-4 h-4" />;
    case 'ppt':
    case 'presentation':
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'quiz':
      return <Trophy className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

export default function TeacherClassesSection({
  subjects, // Renamed from 'classes' in the mock data to 'subjects' from backend
  selectedSubject,
  setSelectedSubject,
  chapters,
  materials,
  activeSection,
  setActiveSection,
  handleViewContent,
  setShowUpload,
  setShowQuizCreator,
  itemVariants
}) {
  // Helper to get materials by chapter and type
  const getMaterialsByChapter = (chapterId, type) => {
    return materials[type].filter(material => material.chapter_id === chapterId);
  };

  return (
    <motion.div
      className="card"
      variants={itemVariants}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary">My Classes</h3>
        <div className="flex gap-2">
          <Button
            className="btn btn-secondary text-sm"
            onClick={() => alert('Add Class functionality to be implemented!')}
          >
            <Plus className="w-4 h-4" />
            Add Class
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {subjects.map((subjectItem) => { // Renamed from classItem to subjectItem for clarity
          const { bg, text } = getColorClasses(subjectItem.color || 'blue'); // Use a default color if not present

          return (
            <motion.div
              key={subjectItem.id}
              className="p-4 rounded-xl border border-border hover:bg-accent transition-colors group"
              whileHover={{ scale: 1.01, x: 4 }}
              transition={{ type: "spring", stiffness: 400 }}
              onClick={() => setSelectedSubject(subjectItem)} // Select subject on click
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${bg} ${text} flex items-center justify-center font-bold`}>
                    {subjectItem.name.split(' ')[0][0]}{subjectItem.name.split(' ')[1] ? subjectItem.name.split(' ')[1][0] : ''} {/* Initials */}
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">{subjectItem.name}</h4>
                    <p className="text-sm text-secondary">
                      {subjectItem.students || 'N/A'} students {/* Assuming students count might be on subject */}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    className="p-2 rounded-lg hover:bg-primary transition-colors"
                    onClick={(e) => { e.stopPropagation(); alert('View Analytics for ' + subjectItem.name); }}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button
                    className="p-2 rounded-lg hover:bg-primary transition-colors"
                    onClick={(e) => { e.stopPropagation(); alert('Manage Settings for ' + subjectItem.name); }}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    className="p-2 rounded-lg hover:bg-primary transition-colors"
                    onClick={(e) => { e.stopPropagation(); alert('More options for ' + subjectItem.name); }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  className="btn btn-primary text-sm flex-1"
                  onClick={(e) => { e.stopPropagation(); setShowUpload(true); setSelectedSubject(subjectItem); }}
                >
                  <Upload className="w-4 h-4" />
                  Upload Content
                </Button>
                <Button
                  className="btn btn-secondary text-sm flex-1"
                  onClick={(e) => { e.stopPropagation(); setSelectedSubject(subjectItem); alert('View Details for ' + subjectItem.name); }}
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Subject Content Management */}
      {selectedSubject && (
        <motion.div
          className="bg-primary rounded-lg shadow p-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-primary">{selectedSubject.name} - Content Management</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowUpload(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Upload Material
              </Button>
              <Button
                onClick={() => setShowQuizCreator(true)}
                className="btn btn-primary flex items-center gap-2 bg-purple-600 hover:bg-purple-700" // Custom color for quiz
              >
                <Trophy className="w-4 h-4" /> Create Quiz
              </Button>
            </div>
          </div>

          {/* Content Type Tabs */}
          <div className="flex space-x-1 mb-6 p-1 rounded-lg bg-accent">
            {[
              { key: 'textbook', label: 'TextBooks (PDF)', icon: '📚' },
              { key: 'ppt', label: 'Presentations (PPT)', icon: '📊' },
              { key: 'quiz', label: 'Quizzes', icon: '🧠' }
            ].map(section => {
              const { bg, text } = getColorClasses(section.key === 'textbook' ? 'blue' : section.key === 'ppt' ? 'green' : 'purple'); // Map to specific colors
              return (
                <Button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
                    activeSection === section.key ? `bg-primary text-blue-600 font-semibold shadow-md` : `text-secondary`
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="font-medium">{section.label}</span>
                  <span
                    className="text-xs px-2 py-1 rounded-full bg-accent text-secondary"
                  >
                    {materials[section.key]?.length || 0}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Content Display by Chapters */}
          <div className="space-y-6">
            {chapters.map(chapter => {
              const chapterMaterials = getMaterialsByChapter(chapter.id, activeSection);

              return (
                <div
                  key={chapter.id}
                  className="border rounded-lg p-4 border-border"
                >
                  <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                    <span>{getContentIcon(activeSection)}</span>
                    {chapter.name}
                    <span className="text-sm text-muted ml-2">
                      ({chapterMaterials.length} {activeSection} files)
                    </span>
                  </h3>

                  {chapterMaterials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Using grid for materials */}
                      {chapterMaterials.map(material => {
                        const { bg, border, text } = getColorClasses(activeSection === 'textbook' ? 'blue' : activeSection === 'ppt' ? 'green' : 'purple'); // Use appropriate color
                        return (
                          <div
                            key={material.id}
                            className={`border rounded p-3 transition-opacity hover:opacity-90 bg-primary border-border`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getContentIcon(activeSection)}</span>
                                <div>
                                  <h4 className="font-medium text-sm text-primary">{material.title}</h4>
                                  <p className="text-xs text-secondary">
                                    {activeSection === 'quiz' ?
                                      `${material.total_questions || 'N/A'} questions • ${material.time_limit || 'N/A'}min` :
                                      material.type?.toUpperCase()
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {activeSection === 'quiz' ? (
                                  <Button
                                    onClick={() => window.location.href = `/teacher-dashboard/quiz/${material.id}/results`}
                                    className="text-sm font-medium text-purple-600 hover:text-purple-700"
                                    variant="link" // Use link variant for text-only button
                                  >
                                    View Results
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      onClick={() => handleViewContent(material)}
                                      className={`text-sm font-medium px-2 py-1 rounded border transition-colors ${border} ${text} hover:bg-accent`}
                                      variant="outline"
                                    >
                                      View
                                    </Button>
                                    <a
                                      href={material.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`text-sm font-medium transition-colors ${text} hover:text-blue-700`}
                                    >
                                      External
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted">
                      <span className="text-3xl mb-2 block">{getContentIcon(activeSection)}</span>
                      <p>No {activeSection} materials uploaded yet</p>
                      <p className="text-sm">
                        {activeSection === 'quiz' ?
                          'Click "Create Quiz" to add quiz assessments' :
                          'Click "Upload Material" to add content'
                        }
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
