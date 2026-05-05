import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@/lib/supabase';
 
export const GET: APIRoute = async ({ url, cookies, request, redirect }) => {
  const code = url.searchParams.get('code');
 
  if (!code) {
    return redirect('/login');
  }
 
  const supabase = createSupabaseServerClient({ cookies, request });
 
  // Intercambia el code por una sesión — esto setea las cookies automáticamente
  const { error } = await supabase.auth.exchangeCodeForSession(code);
 
  if (error) {
    console.error('Error en callback de Google:', error.message);
    return redirect('/login');
  }
 
  // Sesión establecida — redirigir a la página protegida
  return redirect('/protected');
};