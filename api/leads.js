const { getClient } = require('./_db');
const { getSession } = require('./_auth');

module.exports = async (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Yetkisiz erişim.' });
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300);

    if (error) throw error;

    return res.status(200).json({ leads: data });
  } catch (err) {
    console.error('leads error:', err);
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
};
