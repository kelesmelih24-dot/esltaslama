// Korumalı: yeni proje ekler veya mevcut olanı günceller.
// Fotoğraflar tarayıcıda küçültülüp base64 olarak gönderilir, burada Supabase
// Storage'a ("project-images" bucket) yüklenip herkese açık URL alınır.
const { getClient } = require('./_db');
const { getSession } = require('./_auth');

function decodeBase64Image(dataUrl) {
  const match = /^data:(image\/\w+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) return null;
  return { contentType: match[1], buffer: Buffer.from(match[2], 'base64') };
}

async function uploadImage(supabase, dataUrl, prefix) {
  const decoded = decodeBase64Image(dataUrl);
  if (!decoded) return null;

  const ext = decoded.contentType.split('/')[1] || 'jpg';
  const path = `projects/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

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
    const title = String(b.title || '').trim().slice(0, 200);
    const description = String(b.description || '').trim().slice(0, 1000);
    const sortOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : 0;
    const id = b.id ? Number(b.id) : null;

    if (!title) {
      return res.status(400).json({ error: 'Proje başlığı zorunludur.' });
    }

    const supabase = getClient();

    let beforeUrl = b.existingBeforeUrl || null;
    let afterUrl = b.existingAfterUrl || null;

    if (b.beforeImageBase64) {
      beforeUrl = await uploadImage(supabase, b.beforeImageBase64, 'before');
    }
    if (b.afterImageBase64) {
      afterUrl = await uploadImage(supabase, b.afterImageBase64, 'after');
    }

    const row = {
      title,
      description,
      sort_order: sortOrder,
      before_image_url: beforeUrl,
      after_image_url: afterUrl,
    };

    if (id) {
      const { error } = await supabase.from('projects').update(row).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('projects').insert(row);
      if (error) throw error;
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('projects-save error:', err);
    return res.status(500).json({ error: 'Sunucu hatası. Fotoğraf çok büyük olabilir, lütfen tekrar deneyin.' });
  }
};

module.exports.config = {
  api: { bodyParser: { sizeLimit: '12mb' } },
};
