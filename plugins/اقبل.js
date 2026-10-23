const { isElite, extractPureNumber } = require('../haykala/elite');

module.exports = {
  command: 'اقبل',
  description: 'قبول طلبات الانضمام',
  category: 'groups',

  async execute(sock, msg) {
    try {
      const senderJid =
        msg.key.participant ||
        msg.participant ||
        msg.key.remoteJid;

      const senderNumber = extractPureNumber(senderJid);
      const jid = msg.key.remoteJid;

      if (!jid.endsWith('@g.us')) {
        return sock.sendMessage(jid, {
          text: '❌ الأمر للقروبات فقط'
        }, { quoted: msg });
      }

      if (!isElite(senderNumber)) {
        return sock.sendMessage(jid, {
          text: '🚫 هذا الأمر للنخبة فقط'
        }, { quoted: msg });
      }

      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      const arg = text.split(' ')[1];

      if (!arg) {
        return sock.sendMessage(jid, {
          text: '❌ مثال:\n.اقبل 10\n.اقبل الكل'
        }, { quoted: msg });
      }

      // جلب طلبات الانضمام
      const requests = await sock.groupRequestParticipantsList(jid);

      if (!requests || requests.length === 0) {
        return sock.sendMessage(jid, {
          text: '❌ لا توجد طلبات انضمام'
        }, { quoted: msg });
      }

      let selected;

      if (arg === 'الكل') {
        selected = requests;
      } else {
        const number = parseInt(arg);

        if (isNaN(number)) {
          return sock.sendMessage(jid, {
            text: '❌ اكتب رقم أو الكل'
          }, { quoted: msg });
        }

        selected = requests.slice(0, number);
      }

      const users = selected.map(u => u.jid);

      await sock.groupRequestParticipantsUpdate(
        jid,
        users,
        'approve'
      );

      await sock.sendMessage(jid, {
        text: `✅ تم قبول ${users.length} طلب`
      }, { quoted: msg });

    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ خطأ:\n${err.message}`
      }, { quoted: msg });
    }
  }
};