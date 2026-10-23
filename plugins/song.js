const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'اغنية',
  description: 'تحميل أغنية',
  category: 'media',

  async execute(sock, msg) {
    try {

      const jid = msg.key.remoteJid;

      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      const songName = text.replace(/^\.اغنية\s*/i, '').trim();

      if (!songName) {
        return sock.sendMessage(jid, {
          text: '❌ اكتب اسم الأغنية\nمثال:\n.اغنية معقول انساك'
        }, { quoted: msg });
      }

      await sock.sendMessage(jid, {
        text: '⏳ جاري البحث وتحميل الأغنية...'
      }, { quoted: msg });


      const file = path.join(__dirname, 'song.mp3');

      const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 "ytsearch1:${songName}" -o "${file}"`;


      exec(command, async (error) => {

        if (error) {
          return sock.sendMessage(jid, {
            text: `❌ فشل التحميل:\n${error.message}`
          }, { quoted: msg });
        }


        if (!fs.existsSync(file)) {
          return sock.sendMessage(jid, {
            text: '❌ لم يتم العثور على الملف'
          }, { quoted: msg });
        }


        await sock.sendMessage(jid, {
          audio: fs.readFileSync(file),
          mimetype: 'audio/mp4',
          ptt: false
        }, { quoted: msg });


        fs.unlinkSync(file);

      });


    } catch (err) {

      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ خطأ:\n${err.message}`
      }, { quoted: msg });

    }
  }
};