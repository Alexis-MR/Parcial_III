import { createSupabaseServerClient } from '@/lib/supabase';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const loginUser = defineAction({
  accept: 'form',
  input: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    remember_me: z.boolean().optional(),
  }),
  handler: async ({ email, password, remember_me }, context) => {
    const { cookies, request } = context;
    const supabase = createSupabaseServerClient({ request, cookies });

    if (remember_me) {
      cookies.set('email', email, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        path: '/',
      });
    } else {
      cookies.delete('email', { path: '/' });
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        user: {
          uid: data.user?.id,
          email: data.user?.email,
          displayName: data.user?.user_metadata?.name,
          emailVerified: !!data.user?.email_confirmed_at,
          rol: data.user?.user_metadata?.rol ?? 'usuario',
        }
      };

    } catch (error: any) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email o contraseña incorrectos');
      }

      if (error.message.includes('Email not confirmed')) {
        throw new Error('Por favor confirma tu email antes de iniciar sesión');
      }

      console.error('Error de login:', error);
      throw new Error('Error al iniciar sesión');
    }
  },
});