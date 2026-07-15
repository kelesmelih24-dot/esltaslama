// Yeni teklif talebi geldiğinde Telegram'a bildirim gönderen yardımcı modül.
// TELEGRAM_BOT_TOKEN ve TELEGRAM_CHAT_ID ortam değişkenlerine ihtiyaç duyar.
// TELEGRAM_CHAT_ID birden fazla alıcı için virgülle ayrılmış olabilir (örn. "111,222").

async function notifyTelegram(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIdsRaw = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatIdsRaw) return; // yapılandırılmamışsa sessizce geç

  const chatIds = chatIdsRaw.split(',').map((s) => s.trim()).filter(Boolean);
  if (chatIds.length === 0) return;

  const lines = [
    '🔔 *Yeni Teklif Talebi*',
    '',
    `👤 *Ad Soyad:* ${lead.adSoyad || '-'}`,
    lead.firma ? `🏢 *Firma:* ${lead.firma}` : null,
    `📞 *Telefon:* ${lead.telefon || '-'}`,
    lead.eposta ? `✉️ *E-posta:* ${lead.eposta}` : null,
    `📍 *Şehir:* ${lead.sehir || '-'}`,
    lead.hizmet ? `🔧 *Hizmet:* ${lead.hizmet}` : null,
    lead.tezgah ? `⚙️ *Makine:* ${lead.tezgah}` : null,
    '',
    `📝 *Mesaj:*\n${lead.mesaj || '-'}`,
  ].filter(Boolean).join('\n');

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  await Promise.all(chatIds.map((chatId) =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: 'Markdown' }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.text().catch(() => '');
          console.error(`telegram send failed for chat_id ${chatId}: HTTP ${res.status} — ${body}`);
        }
      })
      .catch((err) => {
        console.error(`telegram send network error for chat_id ${chatId}:`, err);
      })
  ));
}

module.exports = { notifyTelegram };
