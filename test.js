const { Client } = require("discord.js")
const options = { intents: ["GUILDS", "GUILD_MESSAGES"] };;
const client = new Client(options);
const fs = require('fs');

client.on("messageCreate", (message) => {
  if (message.content === "d!rank")
  {
    if (message.author.bot == false)
    {
      
      fs.readFile('./moneyger.txt', 'utf8', (err, data) => {
          if (err) {
              console.error('エラーが発生しました:', err);
              return;
            
          }
        let sortedData = "";
        const matchedData = data.match(/@\d+%\s:\s(?:-)\d+$/g);
        for (let i = 0; ; i++) {
          const data1 = matchedData[i].match(/(?:-)\d+$/);
          const data2 = matchedData[i+1].match(/(?:-)\d+$/);
          if (data1 < data2) {
            sortedData += `${data1}\n${data2}\n`
          } else {
            sortedData += `${data2}\n${data1}\n`
          }
          if (i > matchedData.length) {
            break;
          }
        }
        
        data.a
        const newData = sortedData.replaceAll(/@/g, '<@').replaceAll(/\%/g, '>').replaceAll(/\$/g, '云');
        message.send(newData);
        fs.writeFile('./money.txt', newData, 'utf8', (err) => {
             if (err) {
               console.error('ファイルの書き込みに失敗しました:', err);
               
             } else {
               console.log('指定したテキストを置き換えました。');
               
             }

          });

      });
      
    }
    
  }