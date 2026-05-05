import type { MiddlewareNext } from 'astro';
import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase';

const privateRoutes = ['/protected'];
const notAuthenticatedRoutes = ['/login', '/register'];

export const onRequest = defineMiddleware(
  async ({ url, request, locals, redirect, cookies }, next) => {
    const supabase = createSupabaseServerClient({ request, cookies });
    const { data: { session } } = await supabase.auth.getSession();

    const isLoggedIn = !!session;
    const user = session?.user;

    locals.isLoggedIn = isLoggedIn;
if (user) {
      // ✅ Traer rol desde tabla usuarios
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('email', user.email)
        .single();

      locals.user = {
        avatar: user.user_metadata?.avatar_url ?? '',
        email: user.email!,
        name: user.user_metadata?.name ?? '',
        emailVerified: !!user.email_confirmed_at,
        rol: usuario?.rol ?? 'usuario', // ✅ rol desde la tabla
      };
    }

    console.log({ isLoggedIn, user });
    if (!isLoggedIn && privateRoutes.includes(url.pathname)) {
      return redirect('/');
    }

    if (isLoggedIn && notAuthenticatedRoutes.includes(url.pathname)) {
      return redirect('/');
    }

    return next();
  }
);
