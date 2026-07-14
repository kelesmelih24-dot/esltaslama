// Herkese açık: proje (önce/sonra) listesini döner.
const { getClient } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: false });

    if (error) throw error;

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json({ projects: data || [] });
  } catch (err) {
    console.error('projects-list error:', err);
    return res.status(200).json({ projects: [] });
  }
};
