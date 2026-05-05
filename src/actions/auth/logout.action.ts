import { defineAction } from 'astro:actions';
import { createSupabaseServerClient } from '@/lib/supabase';

export const logout = defineAction({
  accept: 'json',
  handler: async (_, { cookies, request }) => {
    const supabase = createSupabaseServerClient({ cookies, request });
    const { error } = await supabase.auth.signOut();

    if (error) throw new Error(error.message);

    return { success: true };
  },
});