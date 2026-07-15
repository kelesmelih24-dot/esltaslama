// Herkese açık: hizmet listesini döner.
const { getClient } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (error) throw error;

    return res.status(200).json({ services: data || [] });
  } catch (err) {
    console.error('services-list error:', err);
    return res.status(200).json({ services: [] });
  }
};
