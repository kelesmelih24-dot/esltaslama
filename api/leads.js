const { sql, ensureSchema } = require('./_db');
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
    await ensureSchema();
    const { rows } = await sql`SELECT * FROM leads ORDER BY created_at DESC LIMIT 300;`;
    return res.status(200).json({ leads: rows });
  } catch (err) {
    console.error('leads error:', err);
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
};
