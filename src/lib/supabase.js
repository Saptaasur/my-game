// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function saveScore(score) {
  const { data, error } = await supabase
    .from('scores')
    .insert([{ score }]);
  if (error) console.error(error);
  return data;
}
