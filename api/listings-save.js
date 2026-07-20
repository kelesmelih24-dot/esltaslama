// Korumalı: yeni ilan ekler veya mevcut olanı günceller (fiyat, durum, fotoğraf dahil).
const { getClient } = require('./_db');
const { getSession } = require('./_auth');

function decodeBase64Image(dataUrl) {
  const match = /^data:(image\/\w+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) return null;
  return { contentType: match[1], buffer: Buffer.from(match[2], 'base64') };
}

async function uploadImage(supabase, dataUrl) {
  const decoded = decodeBase64Image(dataUrl);
  if (!decoded) return null;
  const ext = decoded.contentType.split('/')[1] || 'jpg';
  const path = `listings/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from('project-images')
    .upload(path, decoded.buffer, { contentType: decoded.contentType, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('project-images').getPublicUrl(path);
  return data.publicUrl;
}

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
    const id = b.id ? Number(b.id) : null;
    const title = String(b.title || '').trim().slice(0, 200);
    const description = String(b.description || '').trim().slice(0, 2000);
    const sortOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : 0;
    const status = b.status === 'sold' ? 'sold' : 'available';

    let price = null;
    if (b.price !== undefined && b.price !== null && String(b.price).trim() !== '') {
      const parsed = Number(String(b.price).replace(',', '.'));
      if (Number.isFinite(parsed)) price = parsed;
    }

    let imageUrl = b.existingImageUrl || null;
    if (b.imageBase64) {
      imageUrl = await uploadImage(getClient(), b.imageBase64);
    }

    if (!title && !imageUrl) {
      return res.status(400).json({ error: 'İlan başlığı veya en az bir fotoğraf gerekli.' });
    }

    const supabase = getClient();
    const row = { title, description, price, image_url: imageUrl, status, sort_order: sortOrder };

    if (id) {
      const { error } = await supabase.from('listings').update(row).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('listings').insert(row);
      if (error) throw error;
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('listings-save error:', err);
    return res.status(500).json({ error: 'Sunucu hatası. Fotoğraf çok büyük olabilir, lütfen tekrar deneyin.' });
  }
};

module.exports.config = {
  api: { bodyParser: { sizeLimit: '12mb' } },
};
