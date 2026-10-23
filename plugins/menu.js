const { getPlugins } = require('../handlers/plugins.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  status: "on",
  name: 'Bot Commands',
  command: ['اوامر'],
  category: 'tools',
  description: 'قائمة الأوامر بحسب الفئة',
  hidden: false,
  version: '3.0',

  async execute(sock, msg) {
    try {
      const zarfData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'zarf.json')));
      const body = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
      const args = body.trim().split(' ').slice(1);
      const plugins = getPlugins();
      const categories = {};

      // تجميع الأوامر حسب الفئات
      Object.values(plugins).forEach((plugin) => {
        if (plugin.hidden) return;

        const category = plugin.category?.toLowerCase() || 'others';
        if (!categories[category]) categories[category] = [];

        let commandDisplay = '';

        if (Array.isArray(plugin.command)) {
          plugin.command.forEach(cmd => {
            commandDisplay += `│ ✧ ${cmd}\n`;
          });
        } else {
          commandDisplay = `│ ✧ ${plugin.command}\n`;
        }

        if (plugin.description) {
          commandDisplay += `│   ↳ ${plugin.description}\n`;
        }

        categories[category].push(commandDisplay + '\n');
      });

      // بداية القائمة
      let menu = `
╭━━━〔 𝑲𝑨𝑵𝑨𝑾 𝑩𝑶𝑻 𖠇 〕━━━╮
┃ ✦ 𝑽𝒆𝒓𝒔𝒊𝒐𝒏 ⇢ v3.0
┃ ✦ 𝑷𝒓𝒆𝒇𝒊𝒙 ⇢ °
┃ ✦ 𝑫𝒆𝒗 ⇢ 𝑲𝑨𝑵𝑨𝑾
╰━━━━━━━━━━━━━━━╯

`;

      if (args.length === 0) {
        // عرض الفئات
        menu += '╭───〔 📂 الفئات 〕───╮\n';
        for (const cat of Object.keys(categories)) {
          menu += `│ ✦ 『 ${cat} 』\n`;
        }
        menu += '╰────────────────╯\n';
        menu += '\n✧ اكتب °اوامر [الفئة] لعرض التفاصيل\n';
      } else {
        const requestedCategory = args.join(' ').toLowerCase();

        if (!categories[requestedCategory]) {
          return await sock.sendMessage(msg.key.remoteJid, {
            text: `❌ الفئة *${requestedCategory}* غير موجودة.\nاكتب °اوامر لعرض الفئات.`
          }, { quoted: msg });
        }

        // عرض أوامر الفئة
        menu += `╭───〔 ${requestedCategory.toUpperCase()} ⚡ 〕───╮\n`;
        menu += categories[requestedCategory].join('\n');
        menu += '╰────────────────────╯\n';
      }

      // الفوتر
      menu += `
╭━━━〔 𝑲𝑨𝑵𝑨𝑾 𝑺𝑯𝑶𝑾 🫦 〕━━━╮
┃ ✦ استمتع بالأوامر
┃ ✦ لا تنسى تضيف البوت
╰━━━━━━━━━━━━━━━━╯
`;

      // إرسال الصورة إذا مفعلة
      if (zarfData.media?.status === 'on' && zarfData.media.image) {
        const imgPath = path.join(process.cwd(), zarfData.media.image);

        if (fs.existsSync(imgPath)) {
          const imageBuffer = fs.readFileSync(imgPath);

          return await sock.sendMessage(msg.key.remoteJid, {
            image: imageBuffer,
            caption: menu,
            mimetype: 'image/jpeg'
          }, { quoted: msg });
        }
      }

      // إرسال نص فقط
      await sock.sendMessage(msg.key.remoteJid, { text: menu }, { quoted: msg });

    } catch (error) {
      console.error('❌ Menu Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ صار خطأ أثناء عرض القائمة'
      }, { quoted: msg });
    }
  }
};