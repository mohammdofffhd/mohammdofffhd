module.exports = {
  command: 'حب',

  async execute(sock, msg) {
    const chat = msg.key.remoteJid;

    const sender = msg.key.participant || msg.key.remoteJid;
    const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;

    if (!mentions || !mentions.length) {
      return sock.sendMessage(chat, {
        text: '💔 منشن شخص عشان أحسب نسبة الحب\nمثال:\n.حب @محمد'
      }, { quoted: msg });
    }

    const target = mentions[0];

    const id1 = sender.split('@')[0];
    const id2 = target.split('@')[0];

    // نسبة حب عشوائية
    const love = Math.floor(Math.random() * 101);

    let text;

    if (love >= 90) {
      text = '😍 حب أسطوري';
    } else if (love >= 70) {
      text = '🥰 حب قوي';
    } else if (love >= 40) {
      text = '😊 في إعجاب';
    } else if (love >= 20) {
      text = '😅 حب ضعيف';
    } else {
      text = '💔 ما في توافق';
    }

    await sock.sendMessage(chat, {
      text:
`💘 اختبار الحب

@${id1} ❤️ @${id2}

💞 نسبة الحب: ${love}%
${text}`,
      mentions: [sender, target]
    }, { quoted: msg });
  }
};