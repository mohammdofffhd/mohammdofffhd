const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const { execSync } = require('child_process');

module.exports = {
  status: "on",
  name: "sticker wm",
  command: ["حقوق"],
  category: "tools",

  async execute(sock, msg) {

    const jid = msg.key.remoteJid;

    try {

      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        "";

      const name =
        text.trim().split(" ").slice(1).join(" ");

      if (!name) {
        return sock.sendMessage(jid, {
          text: "❌ اكتب الاسم\nمثال: .حقوق كاناو"
        }, { quoted: msg });
      }

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

      fs.writeFileSync("in.webp", buffer);

      // 🔥 إعادة تشفير (المهم!)
      execSync("ffmpeg -y -i in.webp out.webp");

      const newSticker = fs.readFileSync("out.webp");

      // 📤 إرسال مع حقوق
      await sock.sendMessage(jid, {
        sticker: newSticker,
        packname: `حقوق ${name}`,
        author: "BOT"
      }, { quoted: msg });

      // 🧹 حذف الملفات
      fs.unlinkSync("in.webp");
      fs.unlinkSync("out.webp");

    } catch (err) {

      console.log(err);

      await sock.sendMessage(jid, {
        text: "❌ تأكد ffmpeg مثبت"
      }, { quoted: msg });

    }
  }
};