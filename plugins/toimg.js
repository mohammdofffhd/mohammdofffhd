const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const { execSync } = require('child_process');

module.exports = {
  status: "on",
  name: "toimg",
  command: ["صورة"],
  category: "tools",
  description: "تحويل ملصق إلى صورة",

  async execute(sock, msg) {

    const jid = msg.key.remoteJid;

    try {

      const quoted =
        msg.message?.extendedTextMessage
        ?.contextInfo
        ?.quotedMessage;

      if (!quoted || !quoted.stickerMessage) {
        return sock.sendMessage(jid, {
          text: "❌ رد على ملصق"
        }, { quoted: msg });
      }

      // 📥 تحميل الملصق
      const stream = await downloadContentFromMessage(
        quoted.stickerMessage,
        "sticker"
      );

      let buffer = Buffer.alloc(0);

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      fs.writeFileSync("sticker.webp", buffer);

      // 🔥 تحويل لصورة
      execSync("ffmpeg -y -i sticker.webp image.png");

      const img = fs.readFileSync("image.png");

      // 📤 إرسال الصورة
      await sock.sendMessage(jid, {
        image: img,
        caption: "🖼️ تم التحويل"
      }, { quoted: msg });

      // 🧹 حذف الملفات
      fs.unlinkSync("sticker.webp");
      fs.unlinkSync("image.png");

    } catch (err) {

      console.log(err);

      await sock.sendMessage(jid, {
        text: "❌ تأكد ffmpeg"
      }, { quoted: msg });

    }
  }
};