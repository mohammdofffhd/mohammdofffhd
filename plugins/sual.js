const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

module.exports = {

  name: "سؤال",
  command: ["سؤال"],
  category: "tools",

  async execute(sock, msg) {

    const jid = msg.key.remoteJid;

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      "";

    let query = text.replace(/^[.°]?\s*سؤال\s*/i,"").trim();


    if(!query){
      return sock.sendMessage(jid,{
        text:"❌ اكتب السؤال\nمثال:\n.سؤال ما هو الأمن السيبراني"
      });
    }


    try {

      await sock.sendMessage(jid,{
        text:"🔎 جاري البحث..."
      });


      const url =
      `https://ar.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;


      const { stdout } = await execAsync(
        `curl -L -s "${url}"`
      );


      const data = JSON.parse(stdout);


      if(!data.extract){

        return sock.sendMessage(jid,{
          text:"❌ لم أجد معلومات عن هذا المصطلح"
        });

      }


      let answer = data.extract;


      if(answer.length > 1200){
        answer = answer.substring(0,1200) + "...";
      }


      await sock.sendMessage(jid,{
        text:
`📚 *${query}*

${answer}`
      });


    } catch(e){

      console.log(e.message);

      await sock.sendMessage(jid,{
        text:"❌ حدث خطأ أثناء البحث"
      });

    }

  }

};
