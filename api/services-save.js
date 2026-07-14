// Korumalı: yeni hizmet ekler veya mevcut olanı günceller.
const { getClient } = require('./_db');
const { getSession } = require('./_auth');

module.exports = async (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Yetkisiz erişim.' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const b = req.body || {};
    const title = String(b.title || '').trim().slice(0, 200);
    const description = String(b.description || '').trim().slice(0, 1000);
    const sortOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : 0;
    const id = b.id ? Number(b.id) : null;

    if (!title || !description) {
      return res.status(400).json({ error: 'Başlık ve açıklama zorunludur.' });
    }

    const supabase = getClient();

    if (id) {
      const { error } = await supabase
        .from('services')
        .update({ title, description, sort_order: sortOrder })
        .eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('services')
        .insert({ title, description, sort_order: sortOrder });
      if (error) throw error;
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('services-save error:', err);
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
};
