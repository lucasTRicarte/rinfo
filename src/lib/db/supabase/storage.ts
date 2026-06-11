import { createClient } from './client'

export async function uploadImagem(file: File, pasta: string): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${pasta}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('imagens').upload(path, file)
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('imagens').getPublicUrl(path)
  return data.publicUrl
}
