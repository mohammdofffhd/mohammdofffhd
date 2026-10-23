const { isElite, extractPureNumber } = require('../haykala/elite');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'منشن',
  description: 'منشن مخفي',
  category: 'tools',

  async execute(sock, msg) {
    try {

      const senderJid =
        msg.key.participant ||
        msg.participant ||
        msg.key.remoteJid;

      const senderNumber = extractPureNumber(senderJid);
      const groupJid = msg.key.remoteJid;

      // فقط قروبات
      if (!groupJid.endsWith('@g.us')) {
        return sock.sendMessage(groupJid, {
          text: '❌ الأمر للقروبات فقط.'
        }, { quoted: msg });
      }

      // تحقق نخبة
      if (!isElite(senderNumber)) {
        return sock.sendMessage(groupJid, {
          text: '🚫 هذا الأمر للنخبة فقط.'
        }, { quoted: msg });
      }

      const metadata = await sock.groupMetadata(groupJid);
      const mentions = metadata.participants.map(p => p.id);

      // النص
      const fullText =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      const text = fullText.replace(/^\.منشن\s*/i, '').trim();

      // الرسالة المردود عليها
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      // 🔥 إذا في رد وما كتب نص
      if (quoted && !text) {

        const type = Object.keys(quoted)[0];

        let mediaType;
        if (type === 'imageMessage') mediaType = 'image';
        else if (type === 'videoMessage') mediaType = 'video';
        else if (type === 'audioMessage') mediaType = 'audio';
        else if (type === 'conversation' || type === 'extendedTextMessage') {
          return sock.sendMessage(groupJid, {
            text:
              quoted.conversation ||
              quoted.extendedTextMessage?.text || '',
            mentions
          }, { quoted: msg });
        } else {
          return sock.sendMessage(groupJid, {
            text: '❌ نوع غير مدعوم'
          }, { quoted: msg });
        }

        // تحميل الميديا
        const stream = await downloadContentFromMessage(quoted[type], mediaType);
        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        // إرسالها مع منشن
        if (mediaType === 'image') {
          return sock.sendMessage(groupJid, {
            image: buffer,
            caption: quoted.imageMessage?.caption || '',
            mentions
          }, { quoted: msg });
        }

        if (mediaType === 'video') {
          return sock.sendMessage(groupJid, {
            video: buffer,
            caption: quoted.videoMessage?.caption || '',
            mentions
          }, { quoted: msg });
        }

        if (mediaType === 'audio') {
          return sock.sendMessage(groupJid, {
            audio: buffer,
            mimetype: 'audio/mp4',
            ptt: true,
            mentions
          }, { quoted: msg });
        }
      }

      // 🔥 نص عادي
      if (text) {
        return sock.sendMessage(groupJid, {
          text,
          mentions
        }, { quoted: msg });
      }

      return sock.sendMessage(groupJid, {
        text: '❌ اكتب نص أو رد على رسالة'
      }, { quoted: msg });

    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ خطأ:\n${err.message || err.toString()}`
      }, { quoted: msg });
    }
  }
};