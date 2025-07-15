'use client'
import { useState } from 'react'

export default function ContentViewer({ content, onClose }) {
  const [loading, setLoading] = useState(true)
  const [embedError, setEmbedError] = useState(false)
  
  const getEmbedUrl = (url, type) => {
    if (type === 'pdf' || type === 'textbook') {
      if (url.includes('drive.google.com')) {
        const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        if (fileId) {
          return `https://drive.google.com/file/d/${fileId}/preview`
        }
      }
      return url
    } else if (type === 'ppt' || type === 'presentation') {
      if (url.includes('docs.google.com/presentation')) {
        // Google Slides URL
        const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        if (fileId) {
          // Convert to proper embed URL
          return `https://docs.google.com/presentation/d/${fileId}/embed?start=false&loop=false&delayms=3000`
        }
      } else if (url.includes('drive.google.com')) {
        // PPT files
        const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        if (fileId) {
          return `https://docs.google.com/presentation/d/${fileId}/embed?start=true&loop=false&delayms=3000`
        }
      }
      // PPT files
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
    }
    return url
  }
  
  const embedUrl = getEmbedUrl(content.file_url, content.content_type)
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] m-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{content.content_title}</h3>
            <p className="text-sm text-gray-600">{content.content_type?.toUpperCase()}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={content.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Open in Slides
            </a>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
        
        {/* Content Viewer */}
        <div className="flex-1 relative">
          {loading && !embedError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3">Loading presentation...</span>
            </div>
          )}
          
          {embedError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-semibold mb-2">Unable to Load Presentation</h3>
                <p className="text-gray-600 mb-4">
                  The presentation cannot be embedded. This might be due to browser restrictions or file settings.
                </p>
                <div className="space-y-2">
                  <a
                    href={content.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Open in Google Slides
                  </a>
                  <a
                    href={embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Try Direct Embed Link
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              onLoad={() => setLoading(false)}
              onError={() => setEmbedError(true)}
              title={content.content_title}
              allow="autoplay"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          )}
        </div>
      </div>
    </div>
  )
}
