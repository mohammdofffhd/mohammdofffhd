const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

module.exports = {
  status: "on",
  name: "Sticker",
  command: ["ملصق"],
  category: "tools",

  async execute(sock, msg) {

    const jid = msg.key.remoteJid;

    try {

      const quoted =
        msg.message?.extendedTextMessage
        ?.contextInfo
        ?.quotedMessage;

      if (!quoted || !quoted.imageMessage) {
        return sock.sendMessage(jid, {
          text: "❌ رد على صورة فقط"
        }, { quoted: msg });
      }

      // تحميل الصورة
      const stream =
        await downloadContentFromMessage(
          quoted.imageMessage,
          "image"
        );

      let buffer = Buffer.alloc(0);

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const input = "./sticker_in.jpg";
      const output = "./sticker_out.webp";

      fs.writeFileSync(input, buffer);

      // 🔥 تحويل باستخدام ffmpeg
      execSync(`ffmpeg -y -i ${input} -vf "scale=512:512:force_original_aspect_ratio=decrease" -vcodec libwebp ${output}`);

      const webp = fs.readFileSync(output);

      await sock.sendMessage(jid, {
        sticker: webp
      }, { quoted: msg });

      fs.unlinkSync(input);
      fs.unlinkSync(output);

    } catch (err) {

      console.log(err);

      await sock.sendMessage(jid, {
        text: "❌ ما اشتغل، غالبًا ffmpeg مو مثبت"
      }, { quoted: msg });

    }
  }
};