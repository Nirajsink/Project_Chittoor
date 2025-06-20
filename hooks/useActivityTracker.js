'use client'
import { useEffect, useRef } from 'react'
import { trackActivity, trackContentEngagement } from '@/lib/analytics'

export function useActivityTracker(userId, activityType, resourceId = null, resourceType = null) {
  const startTime = useRef(Date.now())
  const tracked = useRef(false)
  
  useEffect(() => {
    if (userId && !tracked.current) {
      trackActivity(userId, activityType, resourceId, resourceType)
      tracked.current = true
    }
    
    return () => {
      if (userId && activityType === 'content_view' && resourceId) {
        const duration = Math.floor((Date.now() - startTime.current) / 1000)
        trackContentEngagement(resourceId, userId, duration, 100)
      }
    }
  }, [userId, activityType, resourceId, resourceType])
}

export function usePageTimer(onTimeUpdate) {
  const startTime = useRef(Date.now())
  const intervalRef = useRef(null)
  
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000)
      onTimeUpdate?.(elapsed)
    }, 1000)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [onTimeUpdate])
  
  return () => Math.floor((Date.now() - startTime.current) / 1000)
}