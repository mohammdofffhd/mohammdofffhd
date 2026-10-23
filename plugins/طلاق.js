module.exports = {
  command: 'طلاق',

  async execute(sock, msg) {
    const chat = msg.key.remoteJid;

    if (!chat.endsWith('@g.us')) {
      return sock.sendMessage(chat, {
        text: '❌ هذا الأمر للجروبات فقط'
      }, { quoted: msg });
    }

    const metadata = await sock.groupMetadata(chat);
    const members = metadata.participants.map(p => p.id);

    if (members.length < 3) {
      return sock.sendMessage(chat, {
        text: '❌ عدد الأعضاء غير كافي'
      }, { quoted: msg });
    }

    const random1 = members[Math.floor(Math.random() * members.length)];
    let random2 = members[Math.floor(Math.random() * members.length)];

    while (random1 === random2) {
      random2 = members[Math.floor(Math.random() * members.length)];
    }

    const messages = [
      '💔 انتهت القصة بينهما',
      '🥀 الحب خلص.. صار الطلاق رسمي',
      '⚡ قرار صعب لكن تم الطلاق',
      '📜 المحكمة حكمت بالانفصال'
    ];

    const text = messages[Math.floor(Math.random() * messages.length)];

    await sock.sendMessage(chat, {
      text:
`💔 *خبر عاجل*

@${random1.split('@')[0]} 💍 @${random2.split('@')[0]}

تم الطلاق بالتراضي 😂

${text}`,
      mentions: [random1, random2]
    }, { quoted: msg });
  }
};