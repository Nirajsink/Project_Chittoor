'use client'
import { useState, useEffect, useCallback } from 'react'
import { getFileUrl } from '@/lib/storage'

export default function ContentViewer({ chapterId }) {
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)
  
  const fetchContent = useCallback(async () => {
    try {
      const response = await fetch(`/api/content/chapter/${chapterId}`)
      const data = await response.json()
      setContents(data.contents || [])
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }, [chapterId])
  
  useEffect(() => {
    fetchContent()
  }, [fetchContent])
  
  const renderContent = (content) => {
    const isExternalLink = content.file_url.startsWith('http')
    
    switch (content.type) {
      case 'pdf':
        if (isExternalLink) {
          return (
            <a
              href={content.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              📄 View PDF
            </a>
          )
        } else {
          const pdfUrl = getFileUrl('course-materials', content.file_url)
          return (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              📄 View PDF
            </a>
          )
        }
      
      case 'video':
        if (isExternalLink) {
          return (
            <a
              href={content.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-800"
            >
              🎥 Watch Video
            </a>
          )
        } else {
          const videoUrl = getFileUrl('course-materials', content.file_url)
          return (
            <video controls className="w-full max-w-md">
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )
        }
      
      case 'note':
        if (isExternalLink) {
          return (
            <a
              href={content.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800"
            >
              📝 View Notes
            </a>
          )
        } else {
          const noteUrl = getFileUrl('course-materials', content.file_url)
          return (
            <a
              href={noteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800"
            >
              📝 View Notes
            </a>
          )
        }
      
      default:
        return <span className="text-gray-500">Unknown content type</span>
    }
  }
  
  if (loading) {
    return <div className="text-center py-4">Loading content...</div>
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Chapter Materials</h3>
      
      {contents.length === 0 ? (
        <p className="text-gray-500">No content available for this chapter.</p>
      ) : (
        <div className="space-y-3">
          {contents.map(content => (
            <div key={content.id} className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{content.title}</h4>
                  <p className="text-sm text-gray-600 capitalize">{content.type}</p>
                </div>
                <div>
                  {renderContent(content)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
