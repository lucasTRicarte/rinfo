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

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
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
