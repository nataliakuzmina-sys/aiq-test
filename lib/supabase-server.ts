import { createClient } from '@supabase/supabase-js';

// Серверный клиент с service_role — минует RLS.
// Используется ТОЛЬКО в API роутах и Server Components.
// Никогда не должен импортироваться в Client Component:
// SUPABASE_SERVICE_ROLE_KEY не имеет префикса NEXT_PUBLIC_,
// поэтому Next.js не байтит его в клиентский бандл, а импорт
// этого файла на клиенте упадёт с runtime-ошибкой.
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
