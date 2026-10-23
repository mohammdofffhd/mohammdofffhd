const { isElite, extractPureNumber } = require('../haykala/elite');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'فضح',
  description: 'إظهار الوسائط (صورة / فويس / فيديو)',
  category: 'tools',

  async execute(sock, msg) {
    try {

      const senderJid =
        msg.key.participant ||
        msg.participant ||
        msg.key.remoteJid;

      const senderNumber = extractPureNumber(senderJid);
      const jid = msg.key.remoteJid;

      // فقط قروبات
      if (!jid.endsWith('@g.us')) {
        return sock.sendMessage(jid, {
          text: '❌ الأمر للقروبات فقط'
        }, { quoted: msg });
      }

      // تحقق نخبة
      if (!isElite(senderNumber)) {
        return sock.sendMessage(jid, {
          text: '🚫 هذا الأمر للنخبة فقط'
        }, { quoted: msg });
      }

      // الرسالة المردود عليها
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted) {
        return sock.sendMessage(jid, {
          text: '❌ لازم ترد على صورة أو فويس أو فيديو'
        }, { quoted: msg });
      }

      // تحديد نوع الرسالة
      const type = Object.keys(quoted)[0];

      let mediaType;
      if (type === 'imageMessage') mediaType = 'image';
      else if (type === 'videoMessage') mediaType = 'video';
      else if (type === 'audioMessage') mediaType = 'audio';
      else {
        return sock.sendMessage(jid, {
          text: '❌ النوع غير مدعوم'
        }, { quoted: msg });
      }

      // 🔥 تحميل الميديا
      const stream = await downloadContentFromMessage(quoted[type], mediaType);

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // 📸 صورة
      if (mediaType === 'image') {
        return sock.sendMessage(jid, {
          image: buffer,
          caption: '📸 تم الفضح'
        }, { quoted: msg });
      }

      // 🎤 فويس
      if (mediaType === 'audio') {
        return sock.sendMessage(jid, {
          audio: buffer,
          mimetype: 'audio/mp4',
          ptt: true
        }, { quoted: msg });
      }

      // 🎥 فيديو
      if (mediaType === 'video') {
        return sock.sendMessage(jid, {
          video: buffer,
          caption: '🎥 تم الفضح 😈'
        }, { quoted: msg });
      }

    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ خطأ:\n${err.message || err.toString()}`
      }, { quoted: msg });
    }
  }
};