// plugins/middleware/contactBlocker.js
const logger = require('../../utils/console');

/**
 * هذا الميدلوير يتم تنفيذه قبل معالجة أي أمر
 * يقوم بحذف رسائل جهات الاتصال وطرد المرسل
 */
async function contactBlocker(sock, message) {
    try {
        const msg = message.messages ? message.messages[0] : message;
        if (!msg || !msg.message) return;

        const remoteJid = msg.key.remoteJid;
        if (!remoteJid || !remoteJid.endsWith('@g.us')) return; // فقط المجموعات

        // التحقق من أنواع رسائل جهات الاتصال
        const messageType = Object.keys(msg.message)[0];
        let isContact = false;

        // الحالة 1: رسالة جهة اتصال مباشرة
        if (messageType === 'contactMessage') {
            isContact = true;
        }
        // الحالة 2: رسالة نصية تحتوي على vcard
        else if (messageType === 'extendedTextMessage') {
            const text = msg.message.extendedTextMessage?.text || '';
            if (text.includes('BEGIN:VCARD') || text.includes('END:VCARD')) {
                isContact = true;
            }
        }
        // الحالة 3: رسالة مخفية (viewOnce)
        else if (messageType === 'viewOnceMessage') {
            const inner = msg.message.viewOnceMessage?.message;
            if (inner) {
                const innerType = Object.keys(inner)[0];
                if (innerType === 'contactMessage' ||
                    (innerType === 'extendedTextMessage' && (inner.extendedTextMessage?.text || '').includes('VCARD'))) {
                    isContact = true;
                }
            }
        }

        if (!isContact) return;

        const sender = msg.key.participant || msg.key.remoteJid;
        logger.warn(`🔴 تم اكتشاف جهة اتصال من: ${sender}`);

        try {
            // حذف الرسالة
            await sock.sendMessage(remoteJid, {
                delete: {
                    remoteJid: remoteJid,
                    fromMe: false,
                    id: msg.key.id,
                    participant: sender
                }
            });
            logger.success('✅ تم حذف رسالة جهة الاتصال');

            // طرد العضو
            await sock.groupParticipantsUpdate(remoteJid, [sender], 'remove');
            logger.success(`✅ تم طرد العضو: ${sender.split('@')[0]}`);

            return true; // تمت المعالجة، لن نكمل للأوامر
        } catch (error) {
            logger.error(`❌ فشل في حذف/طرد جهة الاتصال: ${error.message}`);
            return false; // نكمل المعالجة العادية في حال فشل الحذف
        }
    } catch (error) {
        logger.error('خطأ في ميدلوير حذف جهات الاتصال:', error.message);
        return false;
    }
}

module.exports = contactBlocker;
