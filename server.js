const http = require("http");
const querystring = require("node:querystring");
require('dotenv').config({ path: './.env' });

//GASでwakeさせること。

http
  .createServer(function(req, res) {
    if (req.method == "POST") {
      var data = "";
      req.on("data", function(chunk) {
        data += chunk;
      });
      req.on("end", function() {
        if (!data) {
          res.end("No post data");
          return;
        }
        var dataObject = querystring.parse(data);
        console.log("post:" + dataObject.type);
        if (dataObject.type == "wake") {
          console.log("Woke up in post");
          res.end();
          return;
        }
        res.end();
      });
    } else if (req.method == "GET") {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end("Discord Bot\"奴隷ちゃん\"はver" + process.env.BOT_Version + "で動作中です");
    }
  })
  .listen(3000);

if (process.env.BOT_TOKEN == undefined || process.env.BOT_TOKEN == "") {
  console.log("BOT_TOKENを設定してください。");
  process.exit(0);
} else {
  require("./code.js");
  require('./commands/register.js');
  require('./commands/index.js');
  require('./functions/button_react.js'); 
}