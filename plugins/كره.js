module.exports = {
  command: 'كره',

  async execute(sock, msg) {
    const chat = msg.key.remoteJid;

    const sender = msg.key.participant || msg.key.remoteJid;
    const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;

    if (!mentions || !mentions.length) {
      return sock.sendMessage(chat, {
        text: '💢 منشن شخص عشان أحسب نسبة الكره\nمثال:\n.كره @محمد'
      }, { quoted: msg });
    }

    const target = mentions[0];

    const id1 = sender.split('@')[0];
    const id2 = target.split('@')[0];

    const hate = Math.floor(Math.random() * 101);

    let text;

    if (hate >= 90) {
      text = '😡 كره شديد';
    } else if (hate >= 70) {
      text = '😤 ما في تفاهم';
    } else if (hate >= 40) {
      text = '😐 شوي زعل';
    } else if (hate >= 20) {
      text = '🙂 عادي';
    } else {
      text = '❤️ ما في كره';
    }

    await sock.sendMessage(chat, {
      text:
`💢 اختبار الكره

@${id1} 💔 @${id2}

نسبة الكره: ${hate}%
${text}`,
      mentions: [sender, target]
    }, { quoted: msg });
  }
};