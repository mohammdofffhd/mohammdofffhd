module.exports = {
  command: 'تقييم',

  async execute(sock, msg) {
    const chat = msg.key.remoteJid;

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    if (!mentioned || !mentioned.length) {
      return sock.sendMessage(chat, {
        text: '❌ منشن شخص\nمثال:\n.تقييم @الشخص'
      }, { quoted: msg });
    }

    const user = mentioned[0];
    const number = user.split('@')[0];

    const score = Math.floor(Math.random() * 101);

    let comment;

    if (score >= 90) {
      comment = '🔥 أسطورة لا يحتاج تقييم';
    } else if (score >= 70) {
      comment = '😎 شخص ممتاز وفخم';
    } else if (score >= 50) {
      comment = '🙂 جيد لكن يحتاج تطوير';
    } else if (score >= 30) {
      comment = '😂 الوضع يحتاج شوية تحسين';
    } else {
      comment = '💀 لا تعليق... حاول مرة ثانية';
    }

    await sock.sendMessage(chat, {
      text: `
⭐ *تقييم الشخص* ⭐

👤 الشخص: @${number}

📊 التقييم: ${score}/100

💬 ${comment}
`,
      mentions: [user]
    }, { quoted: msg });
  }
};