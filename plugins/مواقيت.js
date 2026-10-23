const fetch = require('node-fetch');

module.exports = {
  command: 'مواقيت',

  async execute(sock, msg) {
    const chat = msg.key.remoteJid;

    const body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      '';

    const args = body.split(' ').slice(1);

    if (args.length < 2) {
      return sock.sendMessage(chat, {
        text: `🕌 اكتب المدينة والدولة

مثال:
.مواقيت نابلس فلسطين

أو:
.مواقيت مكة السعودية`
      }, { quoted: msg });
    }

    const city = args[0];
    const country = args.slice(1).join(' ');

    try {
      const res = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`
      );

      const data = await res.json();

      if (!data.data) {
        return sock.sendMessage(chat, {
          text: '❌ لم أجد هذه المدينة، تأكد من الاسم.'
        }, { quoted: msg });
      }

      const t = data.data.timings;

      await sock.sendMessage(chat, {
        text: `
🕌 *مواقيت الصلاة*

📍 ${city} - ${country}

🌅 الفجر: ${t.Fajr}
☀️ الشروق: ${t.Sunrise}
🕛 الظهر: ${t.Dhuhr}
🌤️ العصر: ${t.Asr}
🌇 المغرب: ${t.Maghrib}
🌙 العشاء: ${t.Isha}

🤍 تقبل الله طاعتكم
`
      }, { quoted: msg });

    } catch (err) {
      await sock.sendMessage(chat, {
        text: '❌ تعذر جلب المواقيت حالياً'
      }, { quoted: msg });
    }
  }
};