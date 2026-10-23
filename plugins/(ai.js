module.exports = {
  status: "on",
  name: "AI Image",
  command: ["اصنع"],
  category: "tools",
  description: "صناعة صورة بالذكاء الاصطناعي",

  async execute(sock, msg) {
    try {
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      const prompt = text.split(' ').slice(1).join(' ');

      if (!prompt) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: "❌ اكتب وصف\nمثال: °اصنع تنين ناري"
        }, { quoted: msg });
      }

      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: url },
        caption: `🎨 ${prompt}`
      }, { quoted: msg });

    } catch (e) {
      console.log(e);
    }
  }
};