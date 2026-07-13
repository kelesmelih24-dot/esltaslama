// Ortak veritabanı yardımcı modülü.
// Vercel Postgres bağlandığında POSTGRES_URL ortam değişkeni otomatik tanımlanır.
const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

let schemaReady = false;

async function ensureSchema() {
  if (schemaReady) return;

  await sql`CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  );`;

  await sql`CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    ad_soyad TEXT,
    firma TEXT,
    telefon TEXT,
    eposta TEXT,
    sehir TEXT,
    hizmet TEXT,
    tezgah TEXT,
    mesaj TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );`;

  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM admin_users;`;
  if (rows[0].count === 0) {
    const defaultHash = bcrypt.hashSync('123', 10);
    await sql`INSERT INTO admin_users (username, password_hash)
      VALUES ('admin', ${defaultHash})
      ON CONFLICT (username) DO NOTHING;`;
  }

  schemaReady = true;
}

module.exports = { sql, ensureSchema };
