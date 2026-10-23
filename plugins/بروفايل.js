module.exports = {
    command: 'بروفايل',
    description: 'يجلب صورة بروفايل الشخص المذكور أو المُرد عليه',
    usage: 'بروفايل @مستخدم',
    category: 'tools',

    async execute(sock, msg) {
        try {
            let targetJid = msg.sender; // بشكل افتراضي، يجيب صورته هو

            // 1. إذا كان رداً على رسالة شخص ثاني، خذ رقمه
            if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
                targetJid = msg.message.extendedTextMessage.contextInfo.participant;
            }
            // 2. إذا كان فيه منشن (تاغ)، خذ أول منشن
            else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }

            // جلب الصورة من واتساب
            const ppUrl = await sock.profilePictureUrl(targetJid, 'image');

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: ppUrl },
                caption: `📸 صورة بروفايل @${targetJid.split('@')[0]}`,
                mentions: [targetJid]
            }, { quoted: msg });

        } catch (error) {
            console.error('❌ خطأ البروفايل:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: 'ما حصلت صورة بروفايل لهذا الشخص 🥲'
            }, { quoted: msg });
        }
    }
};