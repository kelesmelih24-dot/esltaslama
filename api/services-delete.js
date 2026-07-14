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
    const { id } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: 'Geçersiz kayıt.' });
    }

    const supabase = getClient();
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('services-delete error:', err);
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
};
