module.exports = {
    command: 'مين',
    description: 'اسأل مين قطوتك',
    usage: 'مين قطوتي',
    category: 'fun',

    async execute(sock, msg, args) {
        try {
            // نجيب النص الكامل للرسالة
            const fullText = msg.body || msg.message?.conversation || '';

            // نفحص إذا كان النص يحتوي على كلمة "قطوتي"
            if (fullText.includes('قطوتي')) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: 'انا قطوتك كيرا مياو مياااو 🐈'
                }, { quoted: msg });
            } else {
                // لو كتب "مين" بس بدون "قطوتي"
                await sock.sendMessage(msg.key.remoteJid, {
                    text: 'اكتب *مين قطوتي* عشان أعرفك 😼'
                }, { quoted: msg });
            }
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
};