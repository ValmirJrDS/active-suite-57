import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL e/ou Anon Key não estão configurados no seu arquivo .env.local');
}

const getRedirectUrl = () => {
  // Em produção (Vercel), usar window.location.origin
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  // Fallback para desenvolvimento local
  return 'http://localhost:8080/auth/callback';
};

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    redirectTo: getRedirectUrl()
  }
});

export default supabase;