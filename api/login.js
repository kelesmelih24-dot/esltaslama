const bcrypt = require('bcryptjs');
const { getClient } = require('./_db');
const { setSessionCookie } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Sunucu yapılandırma hatası: JWT_SECRET tanımlı değil.' });
    }

    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli.' });
    }

    const supabase = getClient();
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) throw error;

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
    }

    setSessionCookie(res, user.username);
    return res.status(200).json({ ok: true, username: user.username });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' });
  }
};
