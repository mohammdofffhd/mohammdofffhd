const logger = require('../utils/console');

let isSetup = false;
let isActive = true;
const KICK_ON_LINKED = true; 

async function getLinkedDeviceCount(sock, jid) {
    try {
        // التأكد من أن دالة جلب الأجهزة موجودة في إصدار المكتبة
        if (typeof sock.getUSyncDevices !== 'function') {
            console.log('❌ [فحص] إصدار Baileys الخاص بك لا يدعم getUSyncDevices');
            return 0;
        }
        const devices = await sock.getUSyncDevices([jid], false, true);
        return devices.length;
    } catch (err) {
        console.log('❌ [فحص] خطأ في جلب الأجهزة:', err.message);
        return 0;
    }
}

function setup(sock) {
    if (isSetup) return;
    isSetup = true;

    logger.info('🛡️ [حماية الانضمام] جاهزة...');

    sock.ev.on('group-participants.update', async (update) => {
        if (!isActive) return;
        if (update.action !== 'add' && update.action !== 'join') return;

        const groupJid = update.id;
        const participants = update.participants;
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        for (const participant of participants) {
            const jid = participant?.id || participant;
            if (!jid || typeof jid !== 'string') continue;
            if (jid === botJid) continue;

            try {
                console.log(`\n🔍 [تشخيص] دخل عضو جديد: ${jid}`);
                const linkedCount = await getLinkedDeviceCount(sock, jid);
                console.log(`📊 [تشخيص] الأجهزة المرتبطة: ${linkedCount}`);

                if (linkedCount > 0) {
                    console.log(`🚨 [حماية] العضو مسوي ربط أجهزة! جاري الطرد...`);
                    
                    await sock.sendMessage(groupJid, {
                        text: `🐾 *قول مياو 🫦!*\n\n@${jid.split('@')[0]} داخل بربط أجهزة (${linkedCount}) — ما نسمح بذا الشي هنا.`,
                        mentions: [jid],
                    });

                    await new Promise(r => setTimeout(r, 1500));

                    try {
                        await sock.groupParticipantsUpdate(groupJid, [jid], 'remove');
                        console.log(`✅ [تشخيص] تم طرد ${jid} بنجاح!`);
                    } catch (kickErr) {
                        console.log(`❌ [تشخيص] فشل طرد ${jid}. السبب:`, kickErr.message);
                    }
                } else {
                    console.log(`✅ [تشخيص] ${jid} سليم.`);
                }
            } catch (err) {
                console.log(`❌ [تشخيص] خطأ أثناء فحص ${jid}:`, err.message);
            }
        }
    });

    setTimeout(() => {
        isActive = false;
        logger.info('🛑 [حماية الانضمام] انتهت الساعتين.');
    }, 2 * 60 * 60 * 1000);
}

module.exports = { setup, getLinkedDeviceCount };
حط ذه بدل الي حطيته