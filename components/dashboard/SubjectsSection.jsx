import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button"; // Ensure this path is correct
import { ChevronRight, BookOpen, Video, Trophy, FileText, Headphones } from 'lucide-react';

// Helper function for Tailwind class mapping
const getColorClasses = (type) => {
  const classes = {
    textbook: { border: 'border-blue-600', text: 'text-blue-600', bg: 'var(--color-blue-100)', hoverBg: 'hover:bg-blue-50' },
    ppt: { border: 'border-green-600', text: 'text-green-600', bg: 'var(--color-green-100)', hoverBg: 'hover:bg-green-50' },
    quiz: { border: 'border-yellow-400', text: 'text-yellow-600', bg: 'var(--color-yellow-100)', hoverBg: 'hover:bg-yellow-50' },
    video: { border: 'border-purple-600', text: 'text-purple-600', bg: 'var(--color-purple-100)', hoverBg: 'hover:bg-purple-50' },
    podcast: { border: 'border-pink-600', text: 'text-pink-600', bg: 'var(--color-pink-100)', hoverBg: 'hover:bg-pink-50' },
  };
  return classes[type] || { border: 'border-gray-400', text: 'text-gray-600', bg: 'var(--bg-card)', hoverBg: 'hover:bg-gray-50' };
};

// Helper for content icons (re-used for consistency)
const getContentIcon = (type) => {
  switch (type) {
    case 'textbook':
    case 'document':
      return <BookOpen className="w-4 h-4" />;
    case 'ppt':
      return <FileText className="w-4 h-4" />;
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'podcast':
      return <Headphones className="w-4 h-4" />;
    case 'quiz':
      return <Trophy className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

// --- openSubject, setOpenSubject, activeType, setActiveType are props ---
export default function SubjectsSection({
  subjects,
  subjectContent,
  loading,
  handleViewContent,
  handleStartQuiz,
  itemVariants,
  openSubject,
  setOpenSubject,
  activeType,
  setActiveType
}) {
  return (
    <motion.div
      className="card"
      variants={itemVariants}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary">Your Subjects</h3>
        <Button
          variant="ghost"
          className="p-0 h-auto text-secondary hover:text-primary"
          onClick={() => setOpenSubject(null)}
          disabled={!openSubject}
          aria-label="Collapse all subjects"
        >
          <ChevronRight className={`w-5 h-5 transform transition-transform ${openSubject ? 'rotate-90' : ''}`} />
        </Button>
      </div>

      {loading ? (
        <div className="min-h-[100px] flex flex-col items-center justify-center">
          <div className="loading-spinner h-8 w-8 mx-auto mb-2 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-blue-700 font-medium">Loading your subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-8 text-secondary">
          <span className="text-4xl mb-4 block">📚</span>
          <h3 className="text-lg font-medium mb-2">No Subjects Available</h3>
          <p className="text-sm">Your subjects haven't been set up yet. Contact your teacher or admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => (
            <motion.div
              key={subject.name}
              className="p-4 rounded-xl border border-border hover:bg-accent transition-colors group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
              onClick={() => setOpenSubject(openSubject === subject.name ? null : subject.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setOpenSubject(openSubject === subject.name ? null : subject.name); }}
              aria-expanded={openSubject === subject.name}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📘</span>
                <div>
                  <h4 className="font-semibold text-primary">{subject.name}</h4>
                  <p className="text-sm text-secondary">
                    {Object.keys(subjectContent[subject.name]?.chapters || {}).length} chapters
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <motion.div
                  className={`h-2 rounded-full bg-blue-500`}
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.progress || 75}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1 text-sm py-2 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenSubject(subject.name);
                  }}
                >
                  Explore Chapters
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Expanded Subject Content (Dropdown) */}
      {openSubject && subjectContent[openSubject] && (
        <motion.div
          className="w-full bg-background rounded-xl shadow-lg p-8 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-primary mb-6">{openSubject} Content</h3>

          {/* Content Type Buttons including Video and Podcast */}
          <div className="flex flex-wrap gap-4 mb-6 justify-center">
            {['textbook', 'ppt', 'video', 'podcast', 'quiz'].map(type => {
              const { border, text, bg } = getColorClasses(type);
              return (
                <Button
                  key={type}
                  variant={activeType === type ? "default" : "outline"}
                  size="lg"
                  className={`
                    capitalize flex items-center gap-2 px-6 py-2 text-lg rounded-full font-semibold
                    transition-all duration-150
                    ${border} ${text}
                    ${activeType === type ? "shadow-md scale-105" : ""}
                  `}
                  style={{ background: activeType === type ? bg : 'var(--bg-card)' }}
                  onClick={() => setActiveType(type)}
                  aria-pressed={activeType === type}
                >
                  {getContentIcon(type)}
                  {type === "textbook" ? "Textbooks" :
                   type === "ppt" ? "Presentations" :
                   type === "video" ? "Videos" :
                   type === "podcast" ? "Podcasts" :
                   "Quizzes"}
                </Button>
              );
            })}
          </div>

          {/* Chapters and Content */}
          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
            {Object.entries(subjectContent[openSubject].chapters).map(([chapterName, chapter]) => (
              <div key={chapterName} className="bg-card rounded-lg p-4 shadow-sm border border-border">
                <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                  <span className="text-xl">📖</span>
                  <span className="text-lg truncate">{chapterName}</span>
                </div>
                <div>
                  {chapter[activeType] && chapter[activeType].length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                      {chapter[activeType].map((content, i) => {
                        const { border, text, hoverBg } = getColorClasses(activeType);
                        return (
                          <motion.div
                            key={i}
                            className={`flex-1 min-w-[180px] max-w-xs p-4 flex flex-col justify-between bg-background ${hoverBg} transition-all duration-150 shadow rounded-md`}
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{getContentIcon(activeType)}</span>
                              <span className="font-medium text-base truncate">{content.content_title}</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              {activeType === 'quiz' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className={`${border} ${text} font-semibold ${hoverBg}`}
                                  onClick={() => handleStartQuiz(content)}
                                >
                                  Take Quiz
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className={`${border} ${text} font-semibold ${hoverBg}`}
                                  onClick={() => handleViewContent(content)}
                                >
                                  View
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-secondary italic pl-2">
                      No {activeType} content for this chapter.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
