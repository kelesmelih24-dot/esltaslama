// Ortak oturum doğrulama yardımcı modülü.
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const COOKIE_NAME = 'esl_admin_session';

function getSession(req) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}

function setSessionCookie(res, username) {
  const secret = process.env.JWT_SECRET;
  const token = jwt.sign({ sub: username }, secret, { expiresIn: '7d' });
  res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  }));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  }));
}

module.exports = { getSession, setSessionCookie, clearSessionCookie, COOKIE_NAME };
