import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

// Database helpers
export const saveUserProfile = async (userId: string, profile: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...profile })
  return { data, error }
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const saveClinicalData = async (userId: string, clinicalData: any) => {
  const { data, error } = await supabase
    .from('clinical_data')
    .insert({ user_id: userId, ...clinicalData })
  return { data, error }
}

export const getClinicalHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('clinical_data')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

// Storage helpers for files (images, audio, documents)
export const uploadFile = async (bucket: string, filePath: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
  return { data, error }
}

export const getFileUrl = (bucket: string, filePath: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)
  return data.publicUrl
}

export const deleteFile = async (bucket: string, filePath: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([filePath])
  return { data, error }
}

// Save clinical data with file attachments
export const saveClinicalDataWithFiles = async (
  userId: string, 
  clinicalData: any, 
  files?: { image?: File, audio?: File }
) => {
  let imageUrl = null
  let audioUrl = null

  // Upload image if provided
  if (files?.image) {
    const imagePath = `${userId}/clinical/${Date.now()}_${files.image.name}`
    const { data: imageData, error: imageError } = await uploadFile('clinical-files', imagePath, files.image)
    if (!imageError && imageData) {
      imageUrl = getFileUrl('clinical-files', imagePath)
    }
  }

  // Upload audio if provided
  if (files?.audio) {
    const audioPath = `${userId}/audio/${Date.now()}_${files.audio.name}`
    const { data: audioData, error: audioError } = await uploadFile('clinical-files', audioPath, files.audio)
    if (!audioError && audioData) {
      audioUrl = getFileUrl('clinical-files', audioPath)
    }
  }

  // Save clinical data with file URLs
  const dataToSave = {
    ...clinicalData,
    image_url: imageUrl,
    audio_url: audioUrl,
    user_id: userId
  }

  const { data, error } = await supabase
    .from('clinical_data')
    .insert(dataToSave)
  
  return { data, error }
}
