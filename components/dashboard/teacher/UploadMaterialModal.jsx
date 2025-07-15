import React from 'react';
import { Button } from "@/components/ui/button"; // Ensure this path is correct
import { BookOpen, Video, FileText } from 'lucide-react'; // Import icons

// Helper for content icons
const getContentIcon = (type) => {
  switch (type) {
    case 'textbook': return <BookOpen className="w-4 h-4" />;
    case 'ppt': return <Video className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

export default function UploadMaterialModal({
  showUpload,
  setShowUpload,
  uploadForm,
  setUploadForm,
  handleUpload,
  uploading,
  chapters
}) {
  if (!showUpload) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-primary rounded-lg p-6 w-full max-w-md mx-auto modal-content shadow-lg border border-border">
        <h3 className="text-lg font-bold mb-4 text-primary">Upload Study Material</h3>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-primary">Content Type</label>
            <select
              value={uploadForm.type}
              onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-primary text-primary border-border"
            >
              <option value="textbook">📚 TextBook (PDF)</option>
              <option value="ppt">📊 Presentation (PPT)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-primary">Chapter</label>
            <select
              value={uploadForm.chapterId}
              onChange={(e) => setUploadForm({ ...uploadForm, chapterId: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-primary text-primary border-border"
              required
            >
              <option value="">Select Chapter</option>
              {chapters.map(chapter => (
                <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-primary">Title</label>
            <input
              type="text"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-primary text-primary border-border"
              placeholder="Enter material title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-primary">Select File</label>
            <input
              type="file"
              onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-primary text-primary border-border"
              accept={uploadForm.type === 'textbook' ? '.pdf' : '.ppt,.pptx'}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={uploading}
              className="flex-1 py-2 rounded transition-opacity hover:opacity-90 disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowUpload(false);
                setUploadForm({ title: '', file: null, chapterId: '', type: 'textbook' });
              }}
              disabled={uploading}
              className="flex-1 py-2 rounded transition-opacity hover:opacity-90 bg-gray-500 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
