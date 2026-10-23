module.exports = {
  status: "on",
  name: "Courage Rate",
  command: ["شجاعة"],
  category: "fun",
  description: "يعطي نسبة شجاعة عشوائية",

  async execute(sock, msg) {

    const jid = msg.key.remoteJid;

    try {

      const mentioned =
        msg.message?.extendedTextMessage
        ?.contextInfo
        ?.mentionedJid || [];

      let target =
        mentioned[0] || msg.key.participant || msg.key.remoteJid;

      const courage =
        Math.floor(Math.random() * 101);

      // 🦁 إيموجي + تعليق حسب النسبة
      let emoji = "🤔";
      let comment = "";

      if (courage <= 20) {
        emoji = "🐔";
        comment = "خواف شوي 😅";
      } else if (courage <= 40) {
        emoji = "😬";
        comment = "يحاول يكون شجاع";
      } else if (courage <= 60) {
        emoji = "🙂";
        comment = "عادي يمشي حاله";
      } else if (courage <= 80) {
        emoji = "🔥";
        comment = "شجاع 💪";
      } else {
        emoji = "🦁";
        comment = "أسد ما يخاف 😎";
      }

      let text =
`🦁 نسبة الشجاعة:

@${target.split("@")[0]} = ${courage}% ${emoji}

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