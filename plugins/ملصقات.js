const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");

const execAsync = promisify(exec);

module.exports = {
  name: "ملصقات",
  command: ["ملصقات"],
  category: "tools",

  async execute(sock, msg) {

    const jid = msg.key.remoteJid;

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      "";

    let query = text.replace(/^[.°]?\s*ملصقات\s*/i, "").trim();


    if (!query) {
      return sock.sendMessage(jid,{
        text:
`❌ اكتب الشيء الذي تريد ملصقاته

مثال:
.ملصقات سيارات
.ملصقات قطط
.ملصقات ناروتو`
      });
    }


    try {

      const base = process.cwd();

      const stickerDir = path.join(base,"stickers");
      const webpDir = path.join(stickerDir,"webp");


      // حذف القديم
      if(fs.existsSync(stickerDir)){
        fs.rmSync(stickerDir,{
          recursive:true,
          force:true
        });
      }


      fs.mkdirSync(webpDir,{
        recursive:true
      });



      await sock.sendMessage(jid,{
        text:`🔎 جاري البحث عن: ${query}`
      });



      // تحميل الصور
      await execAsync(
        `/data/data/com.termux/files/usr/bin/python3 get_images.py "${query.replace(/"/g,'')}"`
      );



      const images = fs.readdirSync(stickerDir)
      .filter(x =>
        x.endsWith(".jpg") ||
        x.endsWith(".png")
      );



      if(!images.length){

        return sock.sendMessage(jid,{
          text:"❌ لم يتم العثور على صور"
        });

      }



      let count = 0;



      for(let i = 0; i < Math.min(images.length,30); i++){


        const input =
        path.join(stickerDir,images[i]);


        const output =
        path.join(webpDir,`sticker_${i}.webp`);



        try {


          await execAsync(
`ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=increase,crop=512:512,drawtext=fontfile=/system/fonts/Roboto-Regular.ttf:text='𝑵𝑶𝑻𝑬 ┋📓┋ 𝑺𝑻𝑰𝑪𝑲𝑬𝑹𝑺':fontcolor=white@0.8:fontsize=26:x=w-tw-10:y=h-th-10:borderw=2:bordercolor=black" -vcodec libwebp -q:v 70 "${output}"`
          );



          if(fs.existsSync(output)){

            await sock.sendMessage(jid,{
              sticker:fs.readFileSync(output)
            });


            count++;

          }



          // تأخير حتى لا ينقطع الاتصال
          await new Promise(r=>setTimeout(r,1500));



        }catch(e){

          console.log(
            "فشل تحويل:",
            e.message
          );

        }

      }



      await sock.sendMessage(jid,{
        text:`✅ تم إرسال ${count} ملصق`
      });



    }catch(e){

      console.log(
        "خطأ:",
        e.message
      );


      await sock.sendMessage(jid,{
        text:"❌ حدث خطأ أثناء إنشاء الملصقات"
      });

    }

  }
};