const { sql, ensureSchema } = require('./_db');
const bcrypt = require('bcryptjs');
const { getSession, setSessionCookie } = require('./_auth');

module.exports = async (req, res) => {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Yetkisiz erişim.' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await ensureSchema();

    const { currentPassword, newUsername, newPassword } = req.body || {};
    if (!currentPassword) {
      return res.status(400).json({ error: 'Mevcut şifrenizi girmeniz gerekiyor.' });
    }
    if (newPassword && newPassword.length < 4) {
      return res.status(400).json({ error: 'Yeni şifre en az 4 karakter olmalı.' });
    }

    const { rows } = await sql`SELECT * FROM admin_users WHERE username = ${session.sub} LIMIT 1;`;
    const user = rows[0];

    if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(401).json({ error: 'Mevcut şifre hatalı.' });
    }

    const finalUsername = (newUsername && newUsername.trim()) ? newUsername.trim() : user.username;
    const finalHash = (newPassword && newPassword.length >= 4)
      ? bcrypt.hashSync(newPassword, 10)
      : user.password_hash;

    await sql`UPDATE admin_users SET username = ${finalUsername}, password_hash = ${finalHash} WHERE id = ${user.id};`;

    setSessionCookie(res, finalUsername);
    return res.status(200).json({ ok: true, username: finalUsername });
  } catch (err) {
    console.error('account error:', err);
    if (err && err.message && err.message.includes('duplicate key')) {
      return res.status(409).json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' });
    }
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
};
