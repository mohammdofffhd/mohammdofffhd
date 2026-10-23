const { isElite } = require('../haykala/elite.js');
const { jidDecode } = require('@whiskeysockets/baileys');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
  command: "تف",
  description: "يقول قول مياو ويطرد",
  usage: ".تف @user",

  async execute(sock, msg) {
    try {
      const chatId = msg.key.remoteJid;
      const sender = decode(msg.key.participant || chatId);
      const senderLid = sender.split('@')[0];

      if (!chatId.endsWith('@g.us')) return;

      if (!(await isElite(senderLid))) {
        return sock.sendMessage(chatId, {
          text: '❌ هذا الأمر للنخبة فقط'
        }, { quoted: msg });
      }

      const metadata = await sock.groupMetadata(chatId);

      const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      if (!mention) {
        return sock.sendMessage(chatId, {
          text: '❌ منشن الشخص أول'
        }, { quoted: msg });
      }

      const exists = metadata.participants.find(p => p.id === mention);
      if (!exists) return;

      // 🔥 الرسالة المطلوبة
      await sock.sendMessage(chatId, {
        text: `قول مياو @${mention.split('@')[0]} 🫦👇🏻`,
        mentions: [mention]
      }, { quoted: msg });

      // ⏳ تأخير بسيط
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 🚪 طرد
      await sock.groupParticipantsUpdate(chatId, [mention], 'remove');

    } catch (error) {
      console.error('✗ خطأ في أمر تف:', error);
    }
  }
};