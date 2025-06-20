'use client'
import { useState, useEffect } from 'react'

export function useUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])
  
  return { user, loading }
}
