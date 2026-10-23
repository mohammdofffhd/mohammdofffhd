const { isElite, extractPureNumber } = require('../haykala/elite');

module.exports = {
  command: 'خش',
  description: 'دخول القروب عبر الرابط',
  category: 'tools',

  async execute(sock, msg) {
    try {

      const senderJid =
        msg.key.participant ||
        msg.participant ||
        msg.key.remoteJid;

      const senderNumber = extractPureNumber(senderJid);
      const jid = msg.key.remoteJid;

      // نخبة فقط
      if (!isElite(senderNumber)) {
        return sock.sendMessage(jid, {
          text: '🚫 هذا الأمر للنخبة فقط'
        }, { quoted: msg });
      }

      // جلب النص
      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      const args = text.split(' ').slice(1);

      if (!args[0]) {
        return sock.sendMessage(jid, {
          text: '❌ حط رابط القروب\nمثال:\n.خش https://chat.whatsapp.com/xxxx'
        }, { quoted: msg });
      }

      const link = args[0];

      // استخراج كود الدعوة
      const inviteCode = link.split('https://chat.whatsapp.com/')[1];

      if (!inviteCode) {
        return sock.sendMessage(jid, {
          text: '❌ الرابط غير صحيح'
        }, { quoted: msg });
      }

      try {
        // 🔥 محاولة دخول مباشر
        await sock.groupAcceptInvite(inviteCode);

        await sock.sendMessage(jid, {
          text: '✅ تم الانضمام بنجاح'
        }, { quoted: msg });

      } catch (err) {

        // ⏳ إذا فشل → غالباً يحتاج موافقة
        try {
          await sock.groupRequestInvite(inviteCode);

          await sock.sendMessage(jid, {
            text: '⏳ تم إرسال طلب انضمام بنجاح'
          }, { quoted: msg });

        } catch (err2) {
          await sock.sendMessage(jid, {
            text: `❌ فشل الدخول:\n${err2.message}`
          }, { quoted: msg });
        }

      }

    } catch (err) {

      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ خطأ:\n${err.message}`
      }, { quoted: msg });

    }
  }
};