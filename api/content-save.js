// Korumalı: hero veya contact içerik bloğunu günceller.
const { getClient } = require('./_db');
const { getSession } = require('./_auth');

const ALLOWED_KEYS = ['hero', 'contact'];

module.exports = async (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Yetkisiz erişim.' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { key, value } = req.body || {};
    if (!ALLOWED_KEYS.includes(key) || !value || typeof value !== 'object') {
      return res.status(400).json({ error: 'Geçersiz içerik anahtarı.' });
    }

    const supabase = getClient();
    const { error } = await supabase
      .from('site_content')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('content-save error:', err);
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
};
