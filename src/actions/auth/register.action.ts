import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createSupabaseServerClient } from "../../lib/supabase";

import { supabaseAdmin } from '@/lib/supabase';

export const registerUserNoSession = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    telefono: z.string().optional(),
    direccion: z.string().optional(),
  }),

  handler: async ({ name, email, password, telefono, direccion }) => {
    // Crear usuario sin correo de confirmación
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Lo marca como confirmado directamente
      user_metadata: { name,  telefono, direccion },
    });

    if (error) {
      if (error.message.includes('already been registered')) {
        throw new Error('El correo ya está registrado');
      }
      throw new Error(error.message ?? 'Error al crear el usuario');
    }

    return {
      success: true,
      message: `Usuario ${name} creado correctamente.`,
      user: {

        id: data.user.id,
        email: data.user.email,
        name,
      },
    };
  },
})

export const registerUser = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    telefono: z.string().optional(),
    direccion: z.string().optional(),
    remember_me: z.boolean().optional(),
  }),

  handler: async ({ name, email, password,telefono, direccion, remember_me }, context) => {
    const { cookies, request } = context;
    const supabase = createSupabaseServerClient({ request, cookies });

    // Remember me
    if (remember_me) {
      cookies.set('name', name, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        path: '/',
      });
      cookies.set('email', email, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        path: '/',
      });
    } else {
      cookies.delete('name', { path: '/' });
      cookies.delete('email', { path: '/' });
    }

    try {
      // 1. Registro en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, telefono, direccion },
          emailRedirectTo: 'http://localhost:4321/protected?emailVerified=true',
        },
      });

      if (error) throw error;

    
     

      return {
        success: true,
        message: 'Cuenta creada correctamente.',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          name,
        },
      };

    } catch (error: any) {
      console.error(error);

      if (error.message.includes('User already registered')) {
        throw new Error('El correo ya está registrado');
      }

      if (error.message.includes('Password should be')) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      throw new Error(error.message ?? 'Ocurrió un error al crear tu cuenta');
    }
  },
});