import type { APIRoute } from 'astro';
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase';

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

  let body: { name?: string; email?: string; rol?: string; telefono?: string; direccion?: string };
  try {
    body = await request.json();
  } catch {
    return json({ message: 'Cuerpo inválido' }, 400);
  }

  const { name, email, rol, telefono, direccion } = body;
  if (!name || !email || !rol) return json({ message: 'Faltan campos requeridos' }, 400);

  const { data: targetUser, error: fetchError } = await supabase
    .from('usuarios')
    .select('auth_id, email')
    .eq('id', id)
    .single();

  if (fetchError || !targetUser) return json({ message: 'Usuario no encontrado' }, 404);

  if (!targetUser.auth_id) {
    return json({ message: 'Usuario sin auth_id vinculado.' }, 500);
  }

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    targetUser.auth_id,
    { email, user_metadata: { name } }
  );

  if (authError) return json({ message: `Error en Auth: ${authError.message}` }, 500);

  const { data, error } = await supabase
    .from('usuarios')
    .update({ name, email, rol, telefono, direccion })
    .eq('id', id)
    .select()
    .single();

  if (error) return json({ message: error.message }, 500);

  return json({ user: data }, 200);
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createSupabaseServerClient({ request, cookies });
  const { data: { session } } = await supabase.auth.getSession();

  console.log('=== DELETE llamado ===');
  console.log('ID:', params.id);
  console.log('Session:', session?.user?.email ?? 'SIN SESIÓN');
  console.log('Cookie:', request.headers.get('Cookie'));

  if (!session) return json({ message: 'No autorizado' }, 401);

  const { data: currentUser } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('email', session.user.email)
    .single();

  if (currentUser?.rol !== 'admin') return json({ message: 'Acceso denegado' }, 403);

  const id = params.id;
  if (!id) return json({ message: 'ID requerido' }, 400);

  const { data: targetUser, error: fetchError } = await supabase
    .from('usuarios')
    .select('auth_id')
    .eq('id', id)
    .single();

  if (fetchError || !targetUser) return json({ message: 'Usuario no encontrado' }, 404);

  const { error: dbError } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id);

  if (dbError) return json({ message: dbError.message }, 500);

  if (targetUser.auth_id) {
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      targetUser.auth_id
    );
    if (authError) {
      console.warn('No se pudo borrar de auth.users:', authError.message);
    }
  }

  return json({ message: 'Usuario eliminado correctamente' }, 200);
};

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}