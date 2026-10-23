const axios = require('axios');

module.exports = {
  command: 'لول',

  async execute(sock, msg) {
    try {

      const chat = msg.key.remoteJid;

      const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      const query = body.replace(/^\.?سينسي\s*/, '').trim();

      if (!query) {
        return sock.sendMessage(chat, {
          text: '❌ اكتب شي ابحث عنه'
        }, { quoted: msg });
      }

      let results = [];

      const { data } = await axios.get(
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        }
      );

      const regex = /<a rel="nofollow" class="result__a" href="(.*?)">(.*?)<\/a>/g;

      let match;
      let count = 0;

      while ((match = regex.exec(data)) !== null && count < 3) {
        let rawLink = match[1];
        const title = match[2].replace(/<[^>]+>/g, '');

        // 🔥 استخراج الرابط الحقيقي
        let realLink = rawLink;

        try {
          const url = new URL('https://duckduckgo.com' + rawLink);
          const uddg = url.searchParams.get('uddg');

          if (uddg) {
            realLink = decodeURIComponent(uddg);
          }
        } catch {}

        results.push(`🔹 ${title}\n${realLink}`);
        count++;
      }

      if (results.length === 0) {
        return sock.sendMessage(chat, {
          text: '❌ ما لقيت نتائج 😔'
        }, { quoted: msg });
      }

      await sock.sendMessage(chat, {
        text: `🔎 نتائج البحث:\n\n${results.join('\n\n')}`
      }, { quoted: msg });

    } catch (err) {
      console.log(err);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ صار خطأ'
      }, { quoted: msg });
    }
  }
};