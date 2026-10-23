module.exports = {
    command: 'فحص',
    description: 'فحص الأعضاء لكشف من يستخدم ربط أجهزة',
    category: 'admin',

    async execute(sock, msg) {
        const jid = msg.key.remoteJid;
        
        if (!jid.endsWith('@g.us')) {
            return sock.sendMessage(jid, { text: '⚠️ هذا الأمر يعمل داخل المجموعات فقط.' }, { quoted: msg });
        }

        try {
            // جلب بيانات الجروب
            const groupMetadata = await sock.groupMetadata(jid);
            const senderJid = msg.key.participant || msg.key.remoteJid;
            
            // التحقق من صلاحيات المرسل
            const participant = groupMetadata.participants.find(p => p.id === senderJid);
            const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';

            if (!isAdmin) {
                return sock.sendMessage(jid, { text: '⚠️ هذا الأمر مخصص للإداريين فقط.' }, { quoted: msg });
            }

            await sock.sendMessage(jid, { text: '🔍 جاري فحص الأعضاء... يرجى الانتظار (قد يأخذ بعض الوقت).' }, { quoted: msg });

            // استدعاء دالة الفحص
            const { getLinkedDeviceCount } = require('../haykala/joinProtection');
            const participants = groupMetadata.participants;
            const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

            let suspects = [];
            let checkedCount = 0;

            for (const p of participants) {
                const participantJid = p.id;
                if (participantJid === botJid) continue;

                try {
                    const linkedCount = await getLinkedDeviceCount(sock, participantJid);
                    if (linkedCount > 0) {
                        suspects.push({
                            jid: participantJid,
                            number: participantJid.split('@')[0],
                            count: linkedCount
                        });
                    }
                } catch (err) {
                    console.log(`⚠️ فشل فحص ${participantJid}: ${err.message}`);
                }

                checkedCount++;
                // تأخير بين كل عضو لتجنب الحظر
                await new Promise(r => setTimeout(r, 1500)); 
            }

            let reportText = `📊 *نتيجة الفحص*\n\n👥 تم فحص: ${checkedCount} عضو\n`;

            if (suspects.length === 0) {
                reportText += `\n✅ ممتاز! لا يوجد أي عضو مسوي ربط أجهزة.`;
            } else {
                reportText += `\n🚨 تم العثور على ${suspects.length} عضو مسوي ربط أجهزة:\n\n`;
                suspects.forEach((s, index) => {
                    reportText += `${index + 1}. @${s.number} (${s.count} أجهزة مرتبطة)\n`;
                });
            }

            await sock.sendMessage(jid, {
                text: reportText,
                mentions: suspects.map(s => s.jid)
            }, { quoted: msg });

        } catch (error) {
            console.error('❌ خطأ في أمر الفحص:', error);
            await sock.sendMessage(jid, { text: '❌ حدث خطأ أثناء الفحص.' }, { quoted: msg });
        }
    }
};