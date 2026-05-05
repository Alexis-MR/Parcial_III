// src/pages/api/usuarios/[id].ts
import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

function createSupabaseAdminClient() {
  const url    = import.meta.env.PUBLIC_SUPABASE_URL;
  const secret = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) throw new Error('Faltan variables de entorno de Supabase');
  return createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createSupabaseServerClient({ request, cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return json({ message: 'No autorizado' }, 401);

  const { data: currentUser } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('email', session.user.email)
    .single();

  if (currentUser?.rol !== 'admin') return json({ message: 'Acceso denegado' }, 403);

  const id = params.id;
  if (!id) return json({ message: 'ID requerido' }, 400);

  let body: { name?: string; email?: string; rol?: string };
  try {
    body = await request.json();
  } catch {
    return json({ message: 'Cuerpo inválido' }, 400);
  }

  const { name, email, rol } = body;
  if (!name || !email || !rol) return json({ message: 'Faltan campos requeridos' }, 400);

  // Obtener auth_id del usuario a editar
  const { data: targetUser, error: fetchError } = await supabase
    .from('usuarios')
    .select('auth_id, email')
    .eq('id', id)
    .single();

  if (fetchError || !targetUser) return json({ message: 'Usuario no encontrado' }, 404);

  if (!targetUser.auth_id) {
    return json({ message: 'Usuario sin auth_id vinculado. Ejecuta el SQL de vinculación.' }, 500);
  }

  // Actualizar en auth.users: nombre Y email siempre
  const adminClient = createSupabaseAdminClient();
  const { error: authError } = await adminClient.auth.admin.updateUserById(
    targetUser.auth_id,
    {
      email,                          // actualiza email en auth.users
      user_metadata: { name },        // actualiza display name en auth.users
    }
  );

  if (authError) {
    return json({ message: `Error en Auth: ${authError.message}` }, 500);
  }

  // Actualizar tabla pública usuarios
  const { data, error } = await supabase
    .from('usuarios')
    .update({ name, email, rol })
    .eq('id', id)
    .select()
    .single();

  if (error) return json({ message: error.message }, 500);

  return json({ user: data }, 200);
};

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}