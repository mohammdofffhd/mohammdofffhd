module.exports = {
  command: 'قوة',

  async execute(sock, msg) {
    const chat = msg.key.remoteJid;

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    if (!mentioned || !mentioned.length) {
      return sock.sendMessage(chat, {
        text: '❌ منشن شخص\nمثال:\n.قوة @الشخص'
      }, { quoted: msg });
    }

    const user = mentioned[0];
    const number = user.split('@')[0];

    const power = Math.floor(Math.random() * 101);

    let level;

    if (power >= 90) {
      level = "👑 وحش لا يُهزم";
    } else if (power >= 70) {
      level = "🔥 قوي جداً";
    } else if (power >= 50) {
      level = "💪 مقاتل جيد";
    } else if (power >= 30) {
      level = "🙂 يحتاج تدريب";
    } else {
      level = "😂 قوته نايمة";
    }

    await sock.sendMessage(chat, {
      text: `
💪 *فحص القوة* 💪

👤 الشخص: @${number}

⚔️ القوة: ${power}/100

🏆 المستوى:
${level}

🔥 قوة الضربة: ${Math.floor(Math.random() * 101)}%
🛡️ الدفاع: ${Math.floor(Math.random() * 101)}%
⚡ السرعة: ${Math.floor(Math.random() * 101)}%

`,
      mentions: [user]
    }, { quoted: msg });
  }
};