module.exports = {
  status: "on",
  name: "Stupid Rate",
  command: ["غباء"],
  category: "fun",
  description: "يعطي نسبة غباء عشوائية",

  async execute(sock, msg) {

    const jid = msg.key.remoteJid;

    try {

      const mentioned =
        msg.message?.extendedTextMessage
        ?.contextInfo
        ?.mentionedJid || [];

      let target =
        mentioned[0] || msg.key.participant || msg.key.remoteJid;

      const stupid =
        Math.floor(Math.random() * 101);

      // 😵 إيموجي حسب النسبة
      let emoji = "🤔";
      let comment = "";

      if (stupid <= 20) {
        emoji = "😇";
        comment = "ما شاء الله، عبقري!";
      } else if (stupid <= 40) {
        emoji = "🙂";
        comment = "عادي تمشي حالك";
      } else if (stupid <= 60) {
        emoji = "😅";
        comment = "في شوية تخبيص 😆";
      } else if (stupid <= 80) {
        emoji = "🤡";
        comment = "الوضع صعب 😂";
      } else {
        emoji = "💀";
        comment = "كارثة بشرية 💔";
      }

      let text =
`🤪 نسبة الغباء:

@${target.split("@")[0]} = ${stupid}% ${emoji}

💬 ${comment}`;

      await sock.sendMessage(jid, {
        text,
        mentions: [target]
      }, { quoted: msg });

    } catch (err) {

      console.log(err);

      await sock.sendMessage(jid, {
        text: "❌ حصل خطأ"
      }, { quoted: msg });

    }
  }
};