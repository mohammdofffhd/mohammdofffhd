module.exports = {
  status: "on",
  name: "IQ Rate",
  command: ["ذكاء"],
  category: "fun",
  description: "يعطي نسبة ذكاء عشوائية",

  async execute(sock, msg) {

    const jid = msg.key.remoteJid;

    try {

      const mentioned =
        msg.message?.extendedTextMessage
        ?.contextInfo
        ?.mentionedJid || [];

      let target =
        mentioned[0] || msg.key.participant || msg.key.remoteJid;

      const iq =
        Math.floor(Math.random() * 101);

      // 🎭 تحديد الإيموجي حسب النسبة
      let emoji = "🤔";

      if (iq <= 20) emoji = "💀";
      else if (iq <= 40) emoji = "😂";
      else if (iq <= 60) emoji = "😐";
      else if (iq <= 80) emoji = "😎";
      else if (iq <= 100) emoji = "🧠";

      let text =
`🧠 نسبة الذكاء:

@${target.split("@")[0]} = ${iq}% ${emoji}`;

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