// Herkese açık: anasayfa metinleri + iletişim bilgilerini döner.
const { getClient } = require('./_db');

const DEFAULTS = {
  hero: {
    eyebrow: 'Tamir · Revizyon · Modernizasyon',
    title: 'Universal taşlama tezgahınıza **yeni teknoloji** kazandırıyoruz',
    subtitle: '20+ yıllık tecrübeyle eski tezgahlarınızı CNC ve PLC destekli modern üretim hattına dönüştürüyoruz. Ankara merkezli, Türkiye geneli yerinde servis.',
  },
  contact: {
    phone1: '0551 589 75 25',
    phone2: '0530 060 42 57',
    email: 'eşahin@mail.ru',
    address: 'İvedik Organize Sanayi, Yenimahalle / Ankara',
    hours: 'Pazartesi – Cumartesi, 08.00–18.00',
  },
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('site_content')
      .select('key, value')
      .in('key', ['hero', 'contact']);

    if (error) throw error;

    const result = { hero: DEFAULTS.hero, contact: DEFAULTS.contact };
    (data || []).forEach((row) => {
      result[row.key] = { ...DEFAULTS[row.key], ...row.value };
    });

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json(result);
  } catch (err) {
    console.error('content-get error:', err);
    // Supabase erişilemezse bile site metinsiz kalmasın diye varsayılanları döndür.
    return res.status(200).json(DEFAULTS);
  }
};
