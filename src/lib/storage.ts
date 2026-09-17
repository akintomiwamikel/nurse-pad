import { supabase } from './supabase'

const BUCKET = 'assignment-files'

export interface UploadedFile {
  id: string
  assignment_id: string
  user_id: string
  file_name: string
  storage_path: string
  file_type: string | null
  file_size_bytes: number | null
  extracted_text: string | null
  processing_status: 'pending' | 'processing' | 'processed' | 'failed'
  created_at: string
}

export async function listAssignmentFiles(assignmentId: string): Promise<UploadedFile[]> {
  const { data, error } = await supabase
    .from('nursing_assignment_files')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as UploadedFile[]
}

/** Uploads a file to Storage under {user_id}/{assignment_id}/{filename}, then records it in the DB. */
export async function uploadAssignmentFile(assignmentId: string, file: File): Promise<UploadedFile> {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const user = userData.user
  if (!user) throw new Error('Not signed in')

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${user.id}/${assignmentId}/${Date.now()}_${safeName}`

  const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (uploadErr) throw uploadErr

  const { data, error } = await supabase
    .from('nursing_assignment_files')
    .insert({
      assignment_id: assignmentId,
      user_id: user.id,
      file_name: file.name,
      storage_path: path,
      file_type: file.type || null,
      file_size_bytes: file.size,
      processing_status: 'pending',
    })
    .select()
    .single()

  if (error) {
    // Roll back the uploaded object if the DB insert failed, so Storage doesn't accumulate orphans
    await supabase.storage.from(BUCKET).remove([path])
    throw error
  }
  return data as UploadedFile
}

export async function getFileDownloadUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 10)
  if (error) throw error
  return data.signedUrl
}

export async function uploadAvatar(file: File): Promise<string> {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const user = userData.user
  if (!user) throw new Error('Not signed in')

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${user.id}/avatar_${Date.now()}.${ext}`

  const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  })
  if (uploadErr) throw uploadErr

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

export async function getTotalStorageUsedBytes(): Promise<{ bytes: number; fileCount: number }> {
  const { data, error } = await supabase.from('nursing_assignment_files').select('file_size_bytes')
  if (error) throw error
  const bytes = (data ?? []).reduce((sum, row) => sum + (row.file_size_bytes ?? 0), 0)
  return { bytes, fileCount: (data ?? []).length }
}
export async function deleteAssignmentFile(id: string, storagePath: string): Promise<void> {
  const { error: storageErr } = await supabase.storage.from(BUCKET).remove([storagePath])
  if (storageErr) throw storageErr
  const { error } = await supabase.from('nursing_assignment_files').delete().eq('id', id)
  if (error) throw error
}
