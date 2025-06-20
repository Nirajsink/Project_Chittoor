'use client'
import { useState } from 'react'

export default function FileUploader({ chapterId, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [uploadType, setUploadType] = useState('pdf')
  const [title, setTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  
  const handleFileUpload = async (e) => {
    e.preventDefault()
    const file = e.target.file.files[0]
    
    if (!file || !title) {
      alert('Please select a file and enter a title')
      return
    }
    
    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('chapterId', chapterId)
      formData.append('title', title)
      formData.append('type', uploadType)
      
      const response = await fetch('/api/content/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('File uploaded successfully!')
        setTitle('')
        e.target.reset()
        onUploadSuccess?.()
      } else {
        alert(data.error || 'Upload failed')
      }
    } catch (error) {
      alert('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }
  
  const handleVideoLink = async (e) => {
    e.preventDefault()
    
    if (!videoUrl || !title) {
      alert('Please enter both title and video URL')
      return
    }
    
    setUploading(true)
    
    try {
      const response = await fetch('/api/content/video-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          title,
          videoUrl
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('Video link added successfully!')
        setTitle('')
        setVideoUrl('')
        onUploadSuccess?.()
      } else {
        alert(data.error || 'Failed to add video link')
      }
    } catch (error) {
      alert('Failed to add video link: ' + error.message)
    } finally {
      setUploading(false)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4">Add Content</h3>
      
      {/* Upload Type Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content Type
        </label>
        <select
          value={uploadType}
          onChange={(e) => setUploadType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="pdf">PDF Document</option>
          <option value="video">Video File</option>
          <option value="note">Notes/Document</option>
        </select>
      </div>
      
      {/* Title Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Enter content title"
        />
      </div>
      
      {uploadType === 'video' ? (
        <>
          {/* Video URL Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video URL (YouTube/Vimeo)
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          
          <button
            onClick={handleVideoLink}
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Adding...' : 'Add Video Link'}
          </button>
        </>
      ) : (
        <>
          {/* File Upload */}
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                type="file"
                name="file"
                accept={uploadType === 'pdf' ? '.pdf' : uploadType === 'video' ? '.mp4,.webm,.ogg' : '.pdf,.doc,.docx,.txt'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
