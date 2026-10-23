module.exports = {
  command: 'كشف',

  async execute(sock, msg) {
    const chat = msg.key.remoteJid;

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    if (!mentioned || !mentioned.length) {
      return sock.sendMessage(chat, {
        text: '❌ منشن شخص\nمثال:\n.كشف @الشخص'
      }, { quoted: msg });
    }

    const user = mentioned[0];
    const number = user.split('@')[0];

    const random = () => Math.floor(Math.random() * 101);

    const text = `
🔍 *كشف الشخصية* 🔍

👤 الشخص: @${number}

😎 الهيبة: ${random()}%
🧠 الذكاء: ${random()}%
🍀 الحظ: ${random()}%
😴 الكسل: ${random()}%
💪 القوة: ${random()}%
⚡ السرعة: ${random()}%
🤍 الطيبة: ${random()}%
🕶️ الغموض: ${random()}%
🔥 الشجاعة: ${random()}%
❤️ الرومانسية: ${random()}%
😂 الإجرام: ${random()}%
👑 الفخامة: ${random()}%
🌈 المزاج: ${random()}%
⭐ الشعبية: ${random()}%


`;

    await sock.sendMessage(chat, {
      text: text,
      mentions: [user]
    }, { quoted: msg });
  }
};