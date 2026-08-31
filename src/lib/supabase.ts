import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env["VITE_SUPABASE_URL"] ||
  "https://dilqghqghlmoudydovij.supabase.co";

const supabaseAnonKey =
  import.meta.env["VITE_SUPABASE_ANON_KEY"] ||
  "sb_publishable_tstQUWMzf2mcvzjEw7b51Q_V9BPw_ok";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
