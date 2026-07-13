const { sql, ensureSchema } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await ensureSchema();

    const b = req.body || {};
    const adSoyad = String(b.adSoyad || '').trim().slice(0, 200);
    const firma = String(b.firma || '').trim().slice(0, 200);
    const telefon = String(b.telefon || '').trim().slice(0, 60);
    const eposta = String(b.eposta || '').trim().slice(0, 200);
    const sehir = String(b.sehir || '').trim().slice(0, 120);
    const hizmet = String(b.hizmet || '').trim().slice(0, 120);
    const tezgah = String(b.tezgah || '').trim().slice(0, 200);
    const mesaj = String(b.mesaj || '').trim().slice(0, 3000);

    if (!adSoyad || !telefon || !sehir || !mesaj) {
      return res.status(400).json({ error: 'Lütfen zorunlu alanları eksiksiz doldurun.' });
    }

    await sql`INSERT INTO leads (ad_soyad, firma, telefon, eposta, sehir, hizmet, tezgah, mesaj)
      VALUES (${adSoyad}, ${firma}, ${telefon}, ${eposta}, ${sehir}, ${hizmet}, ${tezgah}, ${mesaj});`;

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('submit-lead error:', err);
    return res.status(500).json({ error: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' });
  }
};
