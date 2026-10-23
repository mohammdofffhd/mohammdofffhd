const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");

const execAsync = promisify(exec);

module.exports = {

  name: "صور",
  command: ["صور"],
  category: "tools",

  async execute(sock, msg) {

    const jid = msg.key.remoteJid;

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      "";

    let query = text.replace(/^[.°]?\s*صور\s*/i, "").trim();


    if (!query) {
      return sock.sendMessage(jid,{
        text:"❌ اكتب اسم الشخصية\nمثال:\n.صور ناروتو"
      });
    }


    try {

      const folder = path.join(process.cwd(),"stickers");


      if(!fs.existsSync(folder)){
        fs.mkdirSync(folder,{
          recursive:true
        });
      }


      // حذف الصور القديمة
      fs.readdirSync(folder)
      .filter(x =>
        x.endsWith(".jpg") ||
        x.endsWith(".png")
      )
      .forEach(x =>
        fs.unlinkSync(
          path.join(folder,x)
        )
      );


      await sock.sendMessage(jid,{
        text:`🔎 جاري البحث عن: ${query}`
      });



      await execAsync(
        `/data/data/com.termux/files/usr/bin/python3 get_images.py "${query.replace(/"/g,"")}"`
      );



      const files = fs.readdirSync(folder)
      .filter(x =>
        x.endsWith(".jpg") ||
        x.endsWith(".png")
      );


      if(!files.length){

        return sock.sendMessage(jid,{
          text:"❌ لم يتم العثور على صور"
        });

      }



      let count = 0;


      for(let i = 0; i < Math.min(files.length,30); i++){

        try {

          await sock.sendMessage(jid,{
            image: fs.readFileSync(
              path.join(folder,files[i])
            )
          });


          count++;


          await new Promise(
            r=>setTimeout(r,1200)
          );


        }catch(e){

          console.log(
            "خطأ إرسال صورة:",
            e.message
          );

        }

      }



      await sock.sendMessage(jid,{
        text:`✅ تم إرسال ${count} صورة`
      });



    }catch(e){

      console.log(e);

      await sock.sendMessage(jid,{
        text:"❌ حدث خطأ أثناء جلب الصور"
      });

    }

  }
};