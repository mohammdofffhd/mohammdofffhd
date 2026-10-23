const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");

const execAsync = promisify(exec);

module.exports = {
  name: "ايديت",
  command: ["ايديت"],
  category: "tools",

  async execute(sock, msg) {

    const jid = msg.key.remoteJid;

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      "";

    let query = text.replace(/^[.°]?\s*ايديت\s*/i,"").trim();


    if(!query){
      return sock.sendMessage(jid,{
        text:"❌ اكتب اسم الشخصية\nمثال:\n.ايديت ناروتو"
      });
    }


    try {

      await sock.sendMessage(jid,{
        text:`🎬 جاري البحث عن إيديت: ${query}`
      });


      await execAsync(
        `python3 get_edit.py "${query.replace(/"/g,"")}"`
      );


      const file = path.join(
        process.cwd(),
        "edits",
        "edit.mp4"
      );


      if(!fs.existsSync(file)){

        return sock.sendMessage(jid,{
          text:"❌ لم يتم العثور على فيديو"
        });

      }


      await sock.sendMessage(jid,{
        video: fs.readFileSync(file),
        caption:`🔥 ${query} Edit`
      });


      await sock.sendMessage(jid,{
        text:"✅ تم إرسال الإيديت"
      });


    }catch(e){

      console.log(e);

      await sock.sendMessage(jid,{
        text:"❌ حدث خطأ"
      });

    }

  }
};
