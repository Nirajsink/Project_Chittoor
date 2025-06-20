import { supabase, supabaseAdmin } from './supabase'

// Generate unique filename to prevent conflicts
export function generateFileName(originalName) {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${timestamp}-${randomString}.${extension}`
}

// Validate file type and size
export function validateFile(file, allowedTypes, maxSizeMB = 10) {
  const maxSize = maxSizeMB * 1024 * 1024 // Convert to bytes
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`)
  }
  
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`)
  }
  
  return true
}

// Upload file to Supabase Storage
export async function uploadFile(file, bucket, path) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) throw error
  return data
}

// Get public URL for file
export function getFileUrl(bucket, path) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

// Delete file from storage
export async function deleteFile(bucket, path) {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path])
  
  if (error) throw error
  return true
}
