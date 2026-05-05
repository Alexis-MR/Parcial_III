import { defineAction } from 'astro:actions';
import { createSupabaseServerClient } from '@/lib/supabase';

export const loginWithGoogle = defineAction({
  accept: 'json',
  handler: async (_, { cookies, request }) => {
    const supabase = createSupabaseServerClient({ cookies, request });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:4321/protected',
      },
    });

    if (error) throw new Error(error.message);

    return { url: data.url };
  },
});