// Ortak Supabase istemcisi.
// SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY, Vercel ortam değişkenlerinden okunur.
// Service role key yalnızca sunucu tarafında (bu /api fonksiyonlarında) kullanılır,
// tarayıcıya asla gönderilmez.
const { createClient } = require('@supabase/supabase-js');

let client = null;

function getClient() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY tanımlı değil.');
  }

  client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return client;
}

module.exports = { getClient };
