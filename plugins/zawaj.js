module.exports = {
  command: 'زواج',
  async execute(sock, m) {
    try {
      const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
      const participants = groupMetadata.participants.map(p => p.id);

      if (participants.length < 2) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: '❌ ما في أعضاء كفاية للجواز 😅'
        }, { quoted: m });
      }

      // اختيار شخصين عشوائيين
      const shuffled = participants.sort(() => 0.5 - Math.random());
      const groom = shuffled[0];
      const bride = shuffled[1];

      const messages = [
        '💍 ألف مبروك الزواج! الله يتمم عليكم بالخير 💖',
        '🎉 مبروك يا عرسان! حياة مليانة حب وسعادة 😍',
        '🥂 زواج سعيد! عقبالكُم الذرية الصالحة 🤍',
        '💖 تم الزواج بنجاح! مبروك عليكم 😏🔥'
      ];

      const randomMsg = messages[Math.floor(Math.random() * messages.length)];

      const text = `
💒 *زفــة زواج* 💒

🤵 العريس: @${groom.split('@')[0]}
👰 العروسة: @${bride.split('@')[0]}

${randomMsg}
`;

      await sock.sendMessage(m.key.remoteJid, {
        text,
        mentions: [groom, bride]
      }, { quoted: m });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, {
        text: '❌ صار خطأ'
      }, { quoted: m });
    }
  }
};