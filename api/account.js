const bcrypt = require('bcryptjs');
const { getClient } = require('./_db');
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
    const { currentPassword, newUsername, newPassword } = req.body || {};
    if (!currentPassword) {
      return res.status(400).json({ error: 'Mevcut şifrenizi girmeniz gerekiyor.' });
    }
    if (newPassword && newPassword.length < 4) {
      return res.status(400).json({ error: 'Yeni şifre en az 4 karakter olmalı.' });
    }

    const supabase = getClient();
    const { data: user, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', session.sub)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(401).json({ error: 'Mevcut şifre hatalı.' });
    }

    const finalUsername = (newUsername && newUsername.trim()) ? newUsername.trim() : user.username;
    const finalHash = (newPassword && newPassword.length >= 4)
      ? bcrypt.hashSync(newPassword, 10)
      : user.password_hash;

    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ username: finalUsername, password_hash: finalHash })
      .eq('id', user.id);

    if (updateError) {
      if (updateError.code === '23505') {
        return res.status(409).json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' });
      }
      throw updateError;
    }

    setSessionCookie(res, finalUsername);
    return res.status(200).json({ ok: true, username: finalUsername });
  } catch (err) {
    console.error('account error:', err);
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
};
