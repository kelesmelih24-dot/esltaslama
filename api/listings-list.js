// Herkese açık: satıştaki tezgah ilanlarını döner.
const { getClient } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ listings: data || [] });
  } catch (err) {
    console.error('listings-list error:', err);
    return res.status(200).json({ listings: [] });
  }
};
