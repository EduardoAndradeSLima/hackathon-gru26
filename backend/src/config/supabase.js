const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

function getSupabaseClient() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false }
  });
}

module.exports = getSupabaseClient;
