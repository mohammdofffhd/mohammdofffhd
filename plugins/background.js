const fs = require("fs");
const path = require("path");

module.exports = {
  status: "on",
  name: "Random Background",
  command: ["خلفية"],
  category: "fun",
  description: "إرسال خلفية عشوائية",

  async execute(sock, msg) {

    const jid = msg.key.remoteJid;

    try {

      const folderPath = "./media/backgrounds";

      if (!fs.existsSync(folderPath)) {
        return sock.sendMessage(jid, {
          text: "❌ مجلد الخلفيات غير موجود"
        }, { quoted: msg });
      }

      const files = fs.readdirSync(folderPath)
        .filter(file =>
          file.endsWith(".jpg") ||
          file.endsWith(".png") ||
          file.endsWith(".jpeg")
        );

      if (files.length === 0) {
        return sock.sendMessage(jid, {
          text: "❌ ما في صور داخل المجلد"
        }, { quoted: msg });
      }

      const randomFile =
        files[Math.floor(Math.random() * files.length)];

      const filePath =
        path.join(folderPath, randomFile);

      await sock.sendMessage(jid, {
        image: fs.readFileSync(filePath),
        caption: "🖼️ خلفية عشوائية"
      }, { quoted: msg });

    } catch (err) {

      console.log(err);

      await sock.sendMessage(jid, {
        text: "❌ حصل خطأ"
      }, { quoted: msg });

    }
  }
};