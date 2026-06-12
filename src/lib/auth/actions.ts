'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/db/supabase/server'

export type AuthState = { error?: string; success?: string } | null

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: 'E-mail ou senha inválidos.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function cadastro(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'As senhas não coincidem.' }
  }

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password,
    options: {
      data: { nome: formData.get('nome') as string },
    },
  })

  if (error) {
    return { error: 'Não foi possível criar a conta. Verifique os dados e tente novamente.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function atualizarPerfil(data: {
  nome: string
  telefone: string
  foto_url?: string
}): Promise<AuthState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const updateData: Record<string, string> = {
    nome: data.nome,
    telefone: data.telefone,
  }
  if (data.foto_url) updateData.foto_url = data.foto_url

  const { error } = await supabase.from('perfis').update(updateData).eq('id', user.id)
  if (error) return { error: error.message }

  await supabase.auth.updateUser({ data: { nome: data.nome } })

  revalidatePath('/conta')
  return { success: 'Perfil atualizado com sucesso!' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function recuperarSenha(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.get('email') as string,
    { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/nova-senha` }
  )

  if (error) {
    return { error: 'Não foi possível enviar o e-mail. Tente novamente.' }
  }

  return { success: 'E-mail enviado! Verifique sua caixa de entrada.' }
}
