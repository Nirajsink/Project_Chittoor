'use client'
import { useState } from 'react'

export default function ContentViewer({ content, onClose }) {
  const [loading, setLoading] = useState(true)
  const [embedError, setEmbedError] = useState(false)

  // Strictly reject folder URLs for Google Drive
  function isFileUrl(url, type) {
    if (!url || typeof url !== 'string') return false
    // Never allow Drive folder links for file content
    if (url.includes('/drive/folders/') || url.includes('/folders/')) {
      return false
    }
    // Additional basic URL safety
    if (!url.startsWith('http')) return false
    return true
  }

  // Transform URL for embedding
  const getEmbedUrl = (url, type) => {
    // Already validated by isFileUrl, but double-check for safety
    if (!isFileUrl(url, type)) return null

    const lowerType = type?.toLowerCase()
    if (lowerType === 'pdf') {
      if (url.includes('drive.google.com')) {
        const fileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`
      }
      // Fallback for non-Drive URLs
      return url
    } else if (lowerType === 'ppt' || lowerType === 'presentation') {
      if (url.includes('docs.google.com/presentation')) {
        const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        if (fileId) {
          return `https://docs.google.com/presentation/d/${fileId}/embed?start=false&loop=false&delayms=3000`
        }
      } else if (url.includes('drive.google.com')) {
        const fileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        if (fileId) {
          return `https://docs.google.com/presentation/d/${fileId}/embed?start=true&loop=false&delayms=3000`
        }
      }
      // Fallback for other PPT files
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
    } else if (lowerType === 'video' || lowerType === 'mp4') {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        // YouTube URL handling
        let videoId
        if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0]
        } else if (url.includes('youtube.com/watch?v=')) {
          videoId = url.split('v=')[1]?.split('&')[0]
        }
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`
        }
      } else if (url.includes('drive.google.com')) {
        const fileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        if (fileId) {
          return `https://drive.google.com/file/d/${fileId}/preview`
        }
      }
      return url
    } else if (lowerType === 'audio' || lowerType === 'mp3') {
      if (url.includes('drive.google.com')) {
        const fileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        if (fileId) {
          return `https://drive.google.com/file/d/${fileId}/preview`
        }
      }
      return url
    }
    // Fallback: return URL as-is (for unknown/unsupported types)
    return url
  }

  // Validate the content object exists
  if (!content || !content.file_url) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">No Content Available</h3>
          <p className="text-gray-600 mb-4">The requested content could not be found.</p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  // Get content type
  const contentType = content.content_type?.toLowerCase() || 'unknown'
  const isFile = isFileUrl(content.file_url, contentType)
  const embedUrl = isFile ? getEmbedUrl(content.file_url, contentType) : null

  // Get icon for UI
  const getContentIcon = (type) => {
    switch(type) {
      case 'pdf': return '📄'
      case 'ppt':
      case 'presentation': return '📊'
      case 'video':
      case 'mp4': return '🎥'
      case 'audio':
      case 'mp3': return '🎵'
      default: return '📁'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <span className="text-2xl">{getContentIcon(contentType)}</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-lg font-semibold truncate">
                {content.content_title || 'Untitled Content'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 capitalize">
                {contentType.toUpperCase()} • {content.subject_name || 'Unknown Subject'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <a
              href={content.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm hover:bg-blue-700 transition-colors"
            >
              Open Original
            </a>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm hover:bg-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 relative bg-gray-100">
          {/* Loading */}
          {loading && isFile && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <span className="text-sm sm:text-base text-gray-700">Loading content...</span>
              </div>
            </div>
          )}

          {/* If URL rejected as invalid or folder */}
          {!isFile && (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center max-w-md">
                <div className="text-4xl sm:text-6xl mb-4">📁</div>
                <h3 className="text-lg font-semibold mb-2">Cannot Display Content</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {content.file_url
                    ? 'Please use a direct PDF/PPT/file link. Folder links are not supported.'
                    : 'No file URL provided.'
                  }
                </p>
                <div className="space-y-2">
                  {content.file_url && (
                    <a
                      href={content.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      Open in New Tab
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* If true embed error during loading */}
          {embedError && isFile && (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center max-w-md">
                <div className="text-4xl sm:text-6xl mb-4">{getContentIcon(contentType)}</div>
                <h3 className="text-lg font-semibold mb-2">Unable to Load Content</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  The content cannot be embedded. This might be due to browser restrictions or file settings.
                </p>
                <div className="space-y-2">
                  <a
                    href={content.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Open in New Tab
                  </a>
                  {embedUrl && embedUrl !== content.file_url && (
                    <a
                      href={embedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                    >
                      Try Embed Link
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* If valid file URL, show appropriate embed */}
          {(!loading || !isFile) && !embedError && isFile && embedUrl && contentType !== 'audio' && contentType !== 'mp3' && (
            <iframe
              src={embedUrl}
              className="w-full h-full border-0 rounded-b-lg"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false)
                setEmbedError(true)
              }}
              title={content.content_title || 'Content Viewer'}
              allow="autoplay; encrypted-media; fullscreen"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
            />
          )}

          {/* Special handling for audio */}
          {(!loading || !isFile) && !embedError && isFile && embedUrl && (contentType === 'audio' || contentType === 'mp3') && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">🎵</div>
                <audio controls className="mb-4">
                  <source src={embedUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <p className="text-gray-600">{content.content_title}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
