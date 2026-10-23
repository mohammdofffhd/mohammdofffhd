const axios = require('axios');

module.exports = {
  command: 'تحميل',
  description: 'تحميل فيديو من رابط (TikTok / Instagram / YouTube)',

  async execute(sock, msg) {
    try {
      const chat = msg.key.remoteJid;

      const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      const url = body.replace(/^\.?تحميل\s*/, '').trim();

      if (!url) {
        return sock.sendMessage(chat, {
          text: '❌ حط رابط الفيديو\nمثال:\n.تحميل https://...'
        }, { quoted: msg });
      }

      // ❌ منع روابط غير فيديو
      if (url.includes('/tag/') || url.includes('/explore')) {
        return sock.sendMessage(chat, {
          text: '❌ هذا مو رابط فيديو مباشر\nحط رابط فيديو فقط'
        }, { quoted: msg });
      }

      let videoUrl = null;

      // =========================
      // 🔥 1- TikTok
      // =========================
      if (url.includes('tiktok.com') || url.includes('vt.tiktok.com')) {
        try {
          const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
          videoUrl = res.data?.data?.play;
        } catch {}
      }

      // =========================
      // 🔥 2- Instagram
      // =========================
      if (!videoUrl && url.includes('instagram.com')) {
        try {
          const res = await axios.get(`https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`);
          videoUrl = res.data?.data?.video?.[0];
        } catch {}
      }

      // =========================
      // 🔥 3- YouTube
      // =========================
      if (!videoUrl && (url.includes('youtube.com') || url.includes('youtu.be'))) {
        try {
          const res = await axios.get(`https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(url)}`);
          videoUrl = res.data?.data?.url;
        } catch {}
      }

      // =========================
      // ❌ لو فشل كل شي
      // =========================
      if (!videoUrl) {
        return sock.sendMessage(chat, {
          text: '❌ ما قدرت أحمل الفيديو 😔\nتأكد الرابط صحيح أو جرّب غيره'
        }, { quoted: msg });
      }

      // =========================
      // 📥 إرسال الفيديو
      // =========================
      await sock.sendMessage(chat, {
        video: { url: videoUrl },
        caption: '🎬 تم التحميل بنجاح'
      }, { quoted: msg });

    } catch (err) {
      console.log(err);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ صار خطأ أثناء التحميل'
      }, { quoted: msg });
    }
  }
};