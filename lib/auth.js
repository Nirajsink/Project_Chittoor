import bcrypt from 'bcryptjs'
import { supabaseAdmin } from './supabase'

export async function hashPassword(password) {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

export async function getUserByRollNumber(rollNumber) {
  const { data, error } = await supabaseAdmin
    .from('auth_users')
    .select('*')
    .eq('roll_number', rollNumber)
    .single()
  
  if (error) return null
  return data
}

export async function createUser(userData) {
  const hashedPassword = await hashPassword(userData.password)
  
  const { data, error } = await supabaseAdmin
    .from('auth_users')
    .insert([{
      roll_number: userData.rollNumber,
      password: hashedPassword,
      full_name: userData.fullName,
      role: userData.role,
      class: userData.class || null
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}
