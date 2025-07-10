require('dotenv').config({ path: './.env' });
try {const { Util, Client, WebhookClient } = require('discord.js');
const { MessageEmbed, MessageActionRow, MessageButton  } = require('discord.js');
const paginationEmbed = require('discordjs-button-pagination');
const options = { intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_WEBHOOKS"] };
const client = new Client(options);
const { ActivityType } = require('discord.js');

const MakeButton = require('./functions/Button.js');
const randomizeDice = require('./monoline.js'), calculate = require('./monoline.js'), calculateDiceRoll = require('./monoline.js');
const cdr = calculateDiceRoll;

const cron = require('node-cron');
const { DateTime } = require('luxon');

const fs = require('fs');
const uni = '云';
const random = require('./tools/random.js');
const shuffle = require('./tools/shuffle.js');

const { MessageFlags } = require('discord.js');
const flags = MessageFlags;

/*const { joinVoiceChannel, entersState, VoiceConnectionStatus, createAudioResource, StreamType } = require("@discordjs/voice");
const {  createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior, generateDependencyReport } = require("@discordjs/voice");*/
const { Intents } = require('discord.js');

let BANK = "";

////webhookのキャッシュ
 const cacheWebhooks = new Map();
 
 async function sendMessage(message, nickname, content, avatarURL) {
   //Webhookの取得（なければ作成する）
   const webhook = await getWebhookInChannel(message.channel);
   //メッセージ送信（今回は受け取ったものをそのまま送信）
   //usernameとavatarURLをメッセージ発信者のものに指定するのがミソ
   const userAvatar = message.author.avatarURL({ format: 'png', dynamic: false, size: 4096 });
   const bitfield = message.flags.bitfield;
   if (avatarURL === null || avatarURL === undefined || avatarURL === "" || avatarURL === '-1') {
     if (userAvatar === null) {
       avatarURL = 'https://cdn.discordapp.com/embed/avatars/0.png';
     } else {
       avatarURL = userAvatar;
     }
     
   } else if (avatarURL === '0' || avatarURL === 'blue') {
     avatarURL = 'https://cdn.discordapp.com/embed/avatars/0.png';
     
   } else if (avatarURL === '1' || avatarURL === 'gray') {
     avatarURL = 'https://cdn.discordapp.com/embed/avatars/1.png';
     
   } else if (avatarURL === '2' || avatarURL === 'green') {
     avatarURL = 'https://cdn.discordapp.com/embed/avatars/2.png';
     
   } else if (avatarURL === '3' || avatarURL === 'yellow') {
     avatarURL = 'https://cdn.discordapp.com/embed/avatars/3.png';
     
   } else if (avatarURL === '4' ||avatarURL === 'green') {
     avatarURL = 'https://cdn.discordapp.com/embed/avatars/4.png';
     
   } else if (avatarURL === '5' || avatarURL === 'pink') {
     avatarURL = 'https://cdn.discordapp.com/embed/avatars/5.png';
     
   } else if (avatarURL === 'random' || avatarURL === '-2') {
     avatarURL = 'https://cdn.discordapp.com/embed/avatars/'+ random(0,5) +'.png';
     
   } else if (avatarURL === 'default' || avatarURL === '-3') {
     avatarURL = client.user.avatarURL({ format: 'png', dynamic: false, size: 4096 });
     
   }
   if (nickname === '' || nickname === ' ' || nickname === '　') {
     const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
     let uName = ""
     for (let i = 0; i < 8; i++) {
       const randomIndex = Math.floor(Math.random() * characters.length);
       uName += characters[randomIndex];
     }
     nickname = uName;
   }
   const userId = String(message.author);
   const userBack = userId.substr(0, 10) + userId.substr(10);
   var userName;
   if (message.member.nickname === null) {
     userName = message.author.username;
   } else {
     userName = message.member.nickname;
   }
   webhook.send({
     content : content,
     username : `${nickname}\n (${userName})`,
     avatarURL : avatarURL,
     flags: MessageFlags.bitfield = bitfield,
   }).catch(e => console.error(e));
 }
 
 async function getWebhookInChannel(channel) {
   //webhookのキャッシュを自前で保持し速度向上
   const webhook = cacheWebhooks.get(channel.id) ?? await getWebhook(channel)
   return webhook;
 }
 
 async function getWebhook(channel) {
   //チャンネル内のWebhookを全て取得
   const webhooks = await channel.fetchWebhooks();
   //tokenがある（＝webhook製作者がbot自身）Webhookを取得、なければ作成する
   const webhook = webhooks?.find((v) => v.token) ?? await channel.createWebhook("Bot Webhook");
   //キャッシュに入れて次回以降使い回す
   if (webhook) cacheWebhooks.set(channel.id, webhook);
   return webhook;
 }

////webhook終わり

function ResetRoginBonus () {
  fs.readFile('./moneyger.txt', 'utf8', (err, data) => {
          if (err) {
              console.error('エラーが発生しました:', err);
              return;
            
          }
        const newData = data.replaceAll(/\#/g, '');
        console.log(newData);
        fs.writeFile('./moneyger.txt', newData, 'utf8', (err) => {
             if (err) {
               console.error('ファイルの書き込みに失敗しました:', err);
               
             } else {
               console.log('sを削除しました。');
               
             }

          });

      });
}

var version = process.env.BOT_Version;

client.on("ready", async (message) => {
  
  console.log("Bot準備完了！");
  console.log('Bot is ready!');
   
  BANK = client.channels.cache.get('1305886315614572544');
  if (!BANK) {
    console.error('指定されたチャンネルが見つかりません。チャンネルIDを確認してください。');
  } else {
    console.error("正常です。");
  }
  
  const channelId = client.channels.cache.get('1386427307761074268');
  const now = new Date();
  console.log(now);
  if (!channelId) {
    console.error('指定されたチャンネルが見つかりません。チャンネルIDを確認してください。');
  } else {
    console.error("正常です。");
  }
  
    // 次回の実行時刻を計算
  let nextExecutionTime;
  function nextTime(time) {
    let returnPoint;
    if (now.getHours() > time || (now.getHours() === time && now.getMinutes() > 0)) {
      // 現在がtime時を過ぎている場合、次の日のtime時0分に設定
        returnPoint =  new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1, // 次の日
          time, // 時間をtime時に設定
          0 // 分を0分に設定
        );
      console.log('明日やる....');
    } else {
        // 現在が15時以前の場合、今日のtime時0分に設定
          returnPoint =  new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(), // 今日の日付
            time, // 時間をtime時に設定
            0 // 分を0分に設定
        );
      console.log('ねーちゃん！明日って今さッ！');
    }
    return returnPoint;
  }
  nextExecutionTime = nextTime(0);
  
    // 次回実行時刻までのミリ秒を計算
  const timeout = nextExecutionTime.getTime() - now.getTime();
    // タイマーを設定して、次回の0時0分にメッセージを送る
  setTimeout(() => {
    
    ResetRoginBonus();
    channelId.send(MakeButton('login_bonus', '受け取る', '<:1AgoUn:1330571328482316359>', 'Blue', '今日のログインボーナス'));
    let MessageValue = message.content;
    
    const day = now.getDay();
    if (String(day) === "1") {
      channelId.send("月曜日ですよ...");
      const search = './moneyger.txt';
      fs.readFile(search, 'utf8', (err, data) => {
        const point = 100;
        
        const bMatches = data.match(/\n@960172159060279377% : -?\d+\$/);
        const bUserId = bMatches[0].match(/@(\d+)% : (-?\d+)/)[1];
        const bUserPoint = Number(bMatches[0].match(/@(\d+)% : -?(\d+)/)[2]);
        const bUserAdd = bUserPoint + point;

        let bRetxt = `\n@${bUserId}% : ${bUserAdd}`;

        const bNewData = data.replace(/\n@960172159060279377% : -?\d+\$/, bRetxt + '$').replace("#","");
        fs.writeFile('./moneyger.txt', bNewData, 'utf8', (err) => {
          if (err) {
              console.error('ファイルの書き込みに失敗しました:', err);
            } else {
              console.log('指定したテキストを置き換えました。');
            }
        });
      });
    } else {
      channelId.send("さっさと寝な！");
    }
      
  }, timeout);
  
  setTimeout(() => {
    client.channels.cache.get('1373264488886829141').send("<@&1363777949773594776> 今日の[田丸でGO!](https://freegame-mugen.jp/shooting/game_11712.html)");
  }, nextTime(6).getTime() - now.getTime());
  
  console.log("接続に成功しました！");
});

//ここから

client.on("messageCreate", (async message => {
  
  /*入力ウェイト(最短応答時間)
    1000/1秒単位, 1000で1秒
  */
  var timaw = 300;

  if (message.author.bot == false)
    {  
      
      if (message.channel.id == "1364538157386960957") {
        if (/^🥞/.test(message.content)) {} else {
          if (message.content.length > 30) {
            message.reply(`ごめんめっちゃ30文字超えてる\n-# ${message.content.length - 30}文字オーバー`);
          }
        }
      }
      
    //メンションされたとき
      if (message.mentions.users.has(client.user.id)) 
        {
          /*message.react("<:DR:1315167018537848843>");
          var text = "ver2.1に伴い、rおよびdrコマンドにおいての数値上限を6桁までに変更しました。" + 
                 "\n詳しくは[こちら](https://sites.google.com/view/dorecha-plus33421/bot)をご覧ください。"
          message.channel.sendTyping();
            setTimeout(() =>
              {
                message.reply(text);
            
              },timaw);*/
          if (message.channel.type === 2) {
            
          }
          
        }
      
    //ダイスロール
      var type = /^r([1-9]\d{0,5}|0)$/;
      /*v2.1 \d* だった部分を \d{0,5}に変更,
        これにより6桁までの対応に
      */
      if (type.test(message.content)) 
        {
          var str = message.content;
          var max = str.substr(str.indexOf('r') + 1);
              max = Number(max);
          if (max > 0)
            {
              var text = message.content + ' -> ' + (Math.floor(Math.random() * (max + 1 - 1)) + 1);
              message.channel.sendTyping();
                setTimeout(() =>
                  {
                    message.reply(text);
            
                  },timaw);
              
            } else {
              var text = "1以上の数値を入力してください....";
              message.channel.sendTyping();
                setTimeout(() =>
                  {
                    message.reply({content: text, flags: MessageFlags.bitfield=4096});
            
                  },timaw);
              
            }
          
        }
      
    //ダイスロール2
      /*
      var type = /^([1-9]\d{0,2}|0)r([1-9]\d{0,5}|0)$/;
      if (type.test(message.content)) 
        {
          var str = message.content;
          var loop = str.substr(0, str.indexOf('r'));
          var max = str.substr(str.indexOf('r') + 1);
              max = Number(max);
          if (max > 0 | loop > 0)
            { 
             var add = (Math.floor(Math.random() * (max + 1 - 1)) + 1);
             var sum = add;
             var text = add;
              for (  var i = 0;  i < loop -1 ;  i++  )
                 {
                   add = (Math.floor(Math.random() * (max + 1 - 1)) + 1);
                   sum += add;
                   text += ", " + add;

                 }
              text =  message.content + '\n->' + text + '';
              
              message.channel.sendTyping();
                setTimeout(() =>
                  {
                    message.reply(text + " -> " + sum);
            
                  },timaw);
              
            } else {
              var text = "1以上の数値を入力してください....";
              message.channel.sendTyping();
                setTimeout(() =>
                  {
                    message.reply(text);
            
                  },timaw);
              
            }
          
        }*/
      
    //ダイスロール3 
    var type = /^((?:[0-9]\d{0,2}r[0-9]\d{0,3}|[0-9]?\d{0,5})*([\+\-\*\/][0-9]\d{0,5}|[\+\-\*\/]?[0-9]\d{0,2}r[0-9]\d{0,3})+)$/;
      if (type.test(message.content)) {
        const returned = cdr([message.content]);
        const text = Util.escapeMarkdown(returned[0]);
        message.channel.sendTyping();
          setTimeout(() =>
            {
              message.reply({content: text, flags: MessageFlags.bitfield=4096});

            },timaw);
      }
      
    //技能ロール＜通常＞
      var type = /^dr([1-9]\d{0,5}|0)$/;
        if (type.test(message.content)) 
          {
            var str = message.content;
            var max = str.substr(str.indexOf('r') + 1);
                max = Number(max);

                var inrole = (Math.floor(Math.random() * (100 + 1 - 1)) + 1);
                var spc = max / 5
                if (inrole <= max)
                {
                  if (inrole <= 5)
                    {
                      if (inrole <= spc)
                      {
                      if (inrole <= 1)
                        {
                          var text =  '🌟🌟' + message.content + ' => ' + inrole + ' (クリティカル/sp)'

                        } else {
                          var text =  '⭐⭐' + message.content + ' => ' + inrole + ' (クリティカル/sp)'

                        }

                      } else {
                        if (inrole <= 1)
                          {
                            var text =  '🌟' + message.content + ' => ' + inrole + ' (クリティカル！！)'

                          } else {
                            var text =  '⭐' + message.content + ' => ' + inrole + ' (クリティカル！)'

                          }

                      }

                    } else {
                      if (inrole <= spc)
                      {
                        var text =  '✅✅' + message.content + ' => ' + inrole + ' (スペシャル)'

                      } else {
                        var text =  '✅' + message.content + ' => ' + inrole + ' (成功)'

                      }

                    }

                } else {
                  if (inrole <= 95)
                    {
                      var text =  '❌' + message.content + ' => ' + inrole + ' (失敗)'

                    } else {
                      if (inrole < 100)
                        {
                          var text =  '💀' + message.content + ' => ' + inrole + ' (ファンブル..)'

                        } else {
                          var text =  '☠️' + message.content + ' => ' + inrole + ' (ファンブル....)'

                        }

                    }

                }
                message.channel.sendTyping();
                  setTimeout(() =>
                    {
                      message.reply({content: text, flags: MessageFlags.bitfield=4096});

                    },timaw);

          }

    //技能ロール＜SANc＞
      var type = /^sr([1-9]\d{0,1}|0)$/;
        //2桁(99)までしか振ることができない
        if (type.test(message.content)) 
          {
            var str = message.content;
            var max = str.substr(str.indexOf('r') + 1);
                max = Number(max);
            if (max > 0)
              {
                var inrole = (Math.floor(Math.random() * (100 + 1 - 1)) + 1);
                if (inrole <= max)
                {
                  var text =  '✅' + message.content + ' => ' + inrole + ' (成功)'

                } else {
                  var text =  '❌' + message.content + ' => ' + inrole + ' (失敗)'

                }
                message.channel.sendTyping();
                  setTimeout(() =>
                    {
                      message.reply(text);

                    },timaw);

              } else {
                var text = '死んでないですよね..？'
                message.channel.sendTyping();
                  setTimeout(() =>
                    {
                      message.reply({content: text, flags: MessageFlags.bitfield=4096});

                    },timaw);

              }

          }
      
    //SANチェック
      var type = /^sc([1-9]\d{0,1}|0)$/;
        //2桁(99)までしか振ることができない
        if (type.test(message.content)) 
          {
            var str = message.content;
            var max = str.substr(str.indexOf('c') + 1);
                max = Number(max);
            if (max > 0)
              {
                var inrole = (Math.floor(Math.random() * (100 + 1 - 1)) + 1);
                if (inrole <= max)
                {
                  var text =  '✅【SANc】' + message.content + ' => ' + inrole + ' (成功)'

                } else {
                  var text =  '❌【SANc】' + message.content + ' => ' + inrole + ' (失敗)'

                }
                message.channel.sendTyping();
                  setTimeout(() =>
                    {
                      message.reply(text);

                    },timaw);

              } else {
                var text = '死んでないですよね..？'
                message.channel.sendTyping();
                  setTimeout(() =>
                    {
                      message.reply({content: text, flags: MessageFlags.bitfield=4096});

                    },timaw);

              }

          }

    //論理ロール
      var type = /^lr([1-9]\d{0,1}|0)$/;
        if (message.content === 'lr'|| type.test(message.content))
          {
            var inrole = (Math.floor(Math.random() * (1 + 1 - 0)) + 0);
            if (inrole = 1)
            {
              var text =  '✅' + 'true (1)'

            } else {
              var text =  '❌' + 'false (2)'

            }
            message.channel.sendTyping();
              setTimeout(() =>
                {
                  message.reply({content: text, flags: MessageFlags.bitfield=4096});

                },timaw);

          }
      
    //シャッフル
      var type = /^sh[　 ]((?:\S+[　\s]?)+)$/;
        if (type.test(message.content))
          {
            var content = message.content;
            var replaced = content.replaceAll('　', ' ');
            var match = type.exec(replaced);
            var text = shuffle(match[1]);
            
            message.channel.sendTyping();
              setTimeout(() =>
                {
                  message.reply({content: text, flags: MessageFlags.bitfield=4096});

                },timaw);

          }
      
    //チョイス
      var type = /^ch(?<loops>[0-9]{0,2})[　\s]((?:\S+[　\s]?)+)$/;
        if (type.test(message.content))
          {
            var content = message.content;
            var replaced = content.replaceAll('　', ' ');
            var match = type.exec(replaced);
            var shuffled;
            var text = [];
            var loops = match[1]==0|'0'? 1 : match[1];
            console.log(match,loops);
            for (let i=0; i<loops; i++) {
                 shuffled = shuffle(match[2]);
                 var push = shuffled.substr(shuffled.lastIndexOf(' '));
                 text += push;
                 console.log(push);
               }
            console.log(text);
            message.channel.sendTyping();
              setTimeout(() =>
                {
                  message.reply({content: text, flags: MessageFlags.bitfield=4096});

                },timaw);

          }

    //狂気ロール＜1~10＞
      var type = /^mr([1-9]\d{0,1}|0)$/;
        if (message.content === 'mr' || type.test(message.content)) 
          {
            var inmad = Math.floor(Math.random() * (10 + 1 - 1)) + 1;
            var intime = Math.floor(Math.random() * (10 + 1 - 1)) + 1;
            if (inmad == 1)
              {
                var text = '狂気の種類.. ' + inmad + '\n'
                         + '短期: 気絶、あるいは金切声の発作。' + '\n'
                         + '長期: 健忘症(親しい物のことを最初に忘れる；言語や肉体的な技能は働くが、' + '\n'
                         + '　　  知能的な技能は働かない)あるいは混迷／緊張症。' + '\n'
                         + '　//混迷..胎児のような姿勢をとる、物事を忘れる' + '\n'
                         + '　//緊張症..我慢することはできるが意思も興味もない；強制的に単純な行動を' + '\n'
                         + '　  　　　  とらせることはできるが、自発的に行動することはできない';

              } else {
                if (inmad == 2)
                  {
                    var text = '狂気の種類.. ' + inmad + '\n'
                             + '短期: パニック状態で逃げ出す。' + '\n'
                             + '長期: 激しい恐怖症(逃げ出すことはできるが、恐怖の対象はどこへ行っても見える)。';

                  } else {
                    if (inmad == 3)
                      {
                        var text = '狂気の種類.. ' + inmad + '\n'
                                 + '短期: 肉体的なヒステリーあるいは感情の噴出(大笑い、大泣きなど)。' + '\n'
                                 + '長期: 幻覚。';

                      } else {
                        if (inmad == 4)
                          {
                            var text = '狂気の種類.. ' + inmad + '\n'
                                     + '短期: 早口でぶつぶつ言う意味不明の会話あるいは多弁症(一貫した会話の奔流)' + '\n'
                                     + '長期: 奇妙な性的嗜好(露出症、過剰性欲、奇形愛好症など)。';

                          } else {
                            if (inmad == 5)
                              {
                                var text = '狂気の種類.. ' + inmad + '\n'
                                         + '短期: 探索者をその場に釘付けにしてしまうかもしれないような極度の恐怖症。' + '\n'
                                         + '長期: フェティッシュ(探索者はある物、ある種類の物、人物に対し異常なまでに執着する)。';

                              } else {
                                if (inmad == 6)
                                  {
                                    var text = '狂気の種類.. ' + inmad + '\n'
                                             + '短期: 殺人癖あるいは自殺癖。' + '\n'
                                             + '長期: 制御不能のチック、震え、あるいは会話や文章で人と交流することができなくなる。';

                                  } else {
                                    if (inmad == 7)
                                      {
                                        var text = '狂気の種類.. ' + inmad + '\n'
                                                 + '短期: 幻覚あるいは妄想。' + '\n'
                                                 + '長期: 心因性視覚障害、心因性難聴、単数あるいは複数の機能障害。';

                                      } else {
                                        if (inmad == 8)
                                          {
                                            var text = '狂気の種類.. ' + inmad + '\n'
                                                     + '短期: 反響動作あるいは反響言語(探索者は周りの者の動作あるいは発言を反復する)' + '\n'
                                                     + '長期: 短時間の心因反応(支離滅裂、妄想、常軌を逸した振る舞い、幻覚など)。';

                                          } else {
                                            if (inmad == 9)
                                              {
                                                var text = '狂気の種類.. ' + inmad + '\n'
                                                         + '短期: 奇妙なもの、異様なものを食べたがる(泥、粘着物、人肉など)。'  + '\n'
                                                         + '長期: 一時的偏執症。';

                                              } else {
                                                if (inmad == 10)
                                                  {
                                                    var text = '狂気の種類.. ' + inmad + '\n'
                                                             + '短期: 混迷(胎児のような姿勢をとる、物事を忘れる)あるいは緊張症(我慢することは' + '\n'
                                                             + '　　  できるが意思も興味もない；強制的に単純な行動をとらせることはできるが、' + '\n'
                                                             + '　　  自発的に行動することはできない)。' + '\n'
                                                             + '長期: 強迫観念に取りつかれた行動(手を洗い続ける、祈る、特定のリズムで歩く、' + '\n'
                                                             + '　　  割れ目をまたがない、銃を絶え間なくチェックし続けるなど)。';

                                                  }

                                              }

                                          }

                                      }

                                  }

                              }

                          }

                      }

                  }

              }
            message.channel.sendTyping();
              setTimeout(() =>
                {
                  message.reply(text);

                },timaw);

          }
      
    //顎鯖専用
      if (message.guild.id == 1085114259425472533)
        {
        if (message.content === "d!rank")
          {
            fs.readFile('./moneyger.txt', 'utf8', (err, data) => {
                if (err) {
                    console.error('エラーが発生しました:', err);
                    return;

                }
              let sortedData = "";
              const matchedData = data.match(/@\d+%\s\:\s(?:-)?\d+\$/g);
              console.log(matchedData);
              for (let i = 0; ; i++) {
                const data1 = String(matchedData[i]).match(/(?:-)?\d+\$/);
                const data2 = String(matchedData[i+1]).match(/(?:-)?\d+\$/);
                if (data1 < data2) {
                  sortedData += `${matchedData[i]}\n${matchedData[i+1]}\n`
                } else {
                  sortedData += `${matchedData[i+1]}\n${matchedData[i]}\n`
                }
                if (i > matchedData.length) {
                  break;
                }
              }

              data.a
              const newData = sortedData.replaceAll(/@/g, '').replaceAll(/\%/g, '>').replaceAll(/\$/g, '云');
              
              const emb = new MessageEmbed()
                   .setFooter(newData)
              //const row = new MessageActionRow().addComponents(emb);
              
              message.channel.send({embeds: [emb], flags: MessageFlags.bitfield=4096});
              
              fs.writeFile('./money.txt', newData, 'utf8', (err) => {
                   if (err) {
                     console.error('ファイルの書き込みに失敗しました:', err);

                   } else {
                     console.log('指定したテキストを置き換えました。');

                   }

                });

            });

          }
      //シナリオリスト
        var type = /^ist$/;
        var typer = /^istrpg$/;
        var typerr = /^ist1$/;
        var typerrr = /^istrpg1$/;
         if (type.test(message.content) || typer.test(message.content) ||
             typerr.test(message.content) || typerrr.test(message.content))
          {
            var text = '-# created by ' + client.user.username + '\n';
            var text = text + '₀₁🥣[【毒入りスープ】](https://discord.com/channels/1085114259425472533/1264347208527118346/1268790104650940440)\n';
            var text = text + '₀₂🚌[【観光バス】](https://discord.com/channels/1085114259425472533/1270571183506591848/1270571187440848949)\n';
            var text = text + '₀₃🏠[【悪霊の家】](https://discord.com/channels/1085114259425472533/1269129175223242793/1269129184949571587)\n';
            var text = text + '₀₄💡[【影、灯火は見えず】](https://discord.com/channels/1085114259425472533/1271286521571311666/1271286525866414090)';
                text = text + '・🏮[裏](https://discord.com/channels/1085114259425472533/1271382496726224916/)\n';
            var text = text + '₀₅🍣[【お寿司食べたい】](https://discord.com/channels/1085114259425472533/1274207958846148710/1274207963698954304)\n';
            var text = text + '₀₆🌕[【フルムーントリップ】](https://discord.com/channels/1085114259425472533/1276369989125017651/1276369992807485461)\n';
            var text = text + '₀₇🏝️[【絶望の孤島】](https://discord.com/channels/1085114259425472533/1282168654808612894/1282168658885607547)\n';
            var text = text + '₀₈🚢[【報復の白い汽笛】](https://discord.com/channels/1085114259425472533/1285027016013516851/1285027020039782483)\n';
            var text = text + '₀₉⌛[【ノイズシティ】](https://discord.com/channels/1085114259425472533/1287247160026595449/1287247165210628136)\n';
            var text = text + '₁₀☕[【コーヒー一杯分の恐怖】](https://discord.com/channels/1085114259425472533/1297376656100429914/1297376681786478673)\n';
            var text = text + '₁₁⚖️[【白い部屋の天秤】](https://discordapp.com/channels/1085114259425472533/1297419613616869376/1297419616603344978)\n';
            var text = text + '₁₂🪳[【報われない】](https://discord.com/channels/1085114259425472533/1304636830347694090/1304636837096063007)\n';
            var text = text + '₁₃🔙[【バックスペース禁止シナリオ】](https://discordapp.com/channels/1085114259425472533/1309442169198874645/1309442172659040299)\n';
            var text = text + '₁₄🍲[【冬季決闘】](https://discord.com/channels/1085114259425472533/1317315433468268584/1317315441445572618)\n';
            var text = text + '₁₅🐈‍⬛[【魔女の復讐のお手伝い】](https://discord.com/channels/1085114259425472533/1317685472620974221/1317685480690679828)\n';
            var text = text + '₁₆🪇[【レッツアミーゴ】](https://discord.com/channels/1085114259425472533/1321304870430572545/1321304878110216214)\n';
                text = text + 'シナリオ19件中16件を表示中\n続きを表示するには、[istrpg2]または[ist2]と入力してください\n';

            message.channel.sendTyping();
            setTimeout(() =>
              {
                message.reply(text);

              },timaw);

          }
      //シナリオリスト2    
        var type = /^ist2$/;
        var typer = /^istrpg2$/;
          if (type.test(message.content) || typer.test(message.content))
            {
              var text = '-# created by ' + client.user.username + '\n';
              var text = text + '₁₇🏰[【魔術の楽園】](https://discord.com/chann/1322390908544749630/1322390914974613586)\n';
              var text = text + '₁₈⚱️[【壺】](https://discord.com/channels/1085114259425472533/1325662241927987231/1325662248697598003)\n';
              var text = text + '₁₉🧭[【news】](https://discord.com/channels/1085114259425472533/1326859816043413534/1326859822724943914)\n';
              var text = text + '₂₀▪️[【NoTitle】](https://discord.com/channels/1085114259425472533/1264347208527118346)\n';
              var text = text + '₂₁▪️[【NoTitle】](https://discord.com/channels/1085114259425472533/1264347208527118346)\n';
              var text = text + '₂₂▪️[【NoTitle】](https://discord.com/channels/1085114259425472533/1264347208527118346)\n';
              var text = text + '₂₃▪️[【NoTitle】](https://discord.com/channels/1085114259425472533/1264347208527118346)\n';
              var text = text + '₂₄▪️[【NoTitle】](https://discord.com/channels/1085114259425472533/1264347208527118346)\n';
              var text = text + '₂₅▪️[【NoTitle】](https://discord.com/channels/1085114259425472533/1264347208527118346)\n';
              var text = text + '₂₆▪️[【NoTitle】](https://discord.com/channels/1085114259425472533/1264347208527118346)\n';
              var text = text + '₂₇▪️[【NoTitle】](https://discord.com/channels/1085114259425472533/1264347208527118346)\n';
              var text = text + '₂₈▪️[【NoTitle】](https://discord.com/channels/1085114259425472533/1264347208527118346)\n';
              var text = text + '₂₉▪️[【NoTitle】](https://discord.com/channels/1085114259425472533/1264347208527118346)\n';
              var text = text + '₃₀▪️[【NoTitle】](https://discord.com/channels/1085114259425472533/1264347208527118346)\n';
              var text = text + '₃₁▪️[【NoTitle】](https://discord.com/channels/1085114259425472533/1264347208527118346)\n';
              var text = text + '₃₂▪️[【NoTitle】](https://discord.com/channels/1085114259425472533/1264347208527118346)\n';
                  text = text + 'シナリオ19件中18件を表示中\n前のページを表示するには、[istrpg]または[ist1]と入力してください\n';

              message.channel.sendTyping();
              setTimeout(() =>
                {
                  message.reply(text);

                },timaw);

            }

          //頭突きババア
          var type = /頭突きババア/;
          if (type.test(message.content))
            {
              message.react("<:DutsukiBBA:1317703292498870375>");

            }

          //酸味一体教会
          var type = /酸味一体教会/;
          var typer = /惨羅鍛/;
          if (type.test(message.content)||typer.test(message.content))
            {
              message.react("<:SANMI:1320232108295323749>");

            }

          //邪味一性教会
          var type = /邪味/;
          var typer = /イーガ団/;
          if (type.test(message.content)||typer.test(message.content))
            {
              message.react("<:JAMI:1320242331840151562>");

            }

          //アマルテア
          var type = /無駄なことを覚えておく主義ではないのでね/;
          if (type.test(message.content))
            {
              message.react("<:Amalthea:1320244411270959168>");

            }
    //埋め込み
      
      if (message.content === '!list') {
         const embed1 = new MessageEmbed()
           .setTitle('シナリオリスト')
           .setDescription('₀₁🥣[【毒入りスープ】](https://discord.com/channels/1085114259425472533/1264347208527118346/1268790104650940440)\n'
                          +'₀₂🚌[【観光バス】](https://discord.com/channels/1085114259425472533/1269129175223242793/1269129184949571587)\n'
                          +'₀₃🏠[【悪霊の家】](https://discord.com/channels/1085114259425472533/1270571183506591848/1270571187440848949)\n'
                          +'₀₄💡[【影、灯火は見えず】](https://discord.com/channels/1085114259425472533/1271286521571311666/1271286525866414090)'
                            +'・🏮[裏](https://discord.com/channels/1085114259425472533/1271382496726224916/)\n'
                          +'₀₅🍣[【お寿司食べたい】](https://discord.com/channels/1085114259425472533/1274207958846148710/1274207963698954304)\n'
                          +'₀₆🌕[【フルムーントリップ】](https://discord.com/channels/1085114259425472533/1276369989125017651/1276369992807485461)\n'
                          +'₀₇🏝️[【絶望の孤島】](https://discord.com/channels/1085114259425472533/1282168654808612894/1282168658885607547)\n'
                          +'₀₈🚢[【報復の白い汽笛】](https://discord.com/channels/1085114259425472533/1285027016013516851/1285027020039782483)\n'
                          +'₀₉⌛[【ノイズシティ】](https://discord.com/channels/1085114259425472533/1287247160026595449/1287247165210628136)\n'
                          +'₁₀☕[【コーヒー一杯分の恐怖】](https://discord.com/channels/1085114259425472533/1297376656100429914/1297376681786478673)\n'
                          +'₁₁⚖️[【白い部屋の天秤】](https://discordapp.com/channels/1085114259425472533/1297419613616869376/1297419616603344978)\n'
                          +'₁₂🪳[【報われない】](https://discord.com/channels/1085114259425472533/1304636830347694090/1304636837096063007)\n'
                          +'₁₃🔙[【バックスペース禁止シナリオ】](https://discordapp.com/channels/1085114259425472533/1309442169198874645/1309442172659040299)\n'
                          +'₁₄🍲[【冬季決闘】](https://discord.com/channels/1085114259425472533/1317315433468268584/1317315441445572618)\n'
                          +'₁₅🐈‍⬛[【魔女の復讐のお手伝い】](https://discord.com/channels/1085114259425472533/1317685472620974221/1317685480690679828)\n'
                          +'₁₆🪇[【レッツアミーゴ】](https://discord.com/channels/1085114259425472533/1321304870430572545/1321304878110216214)\n'
                          +'₁₇🏰[【魔術の楽園】](https://discord.com/channels/1085114259425472533/1322390908544749630/1322390914974613586)\n'
                          +'₁₈⚱️[【壺】](https://discord.com/channels/1085114259425472533/1325662241927987231/1325662248697598003)\n'
                          )
           .setURL('https://sites.google.com/view/dorecha-plus33421/')
           .addFields({name:'24件中18件を表示',value:'下部ボタンで操作してください',inline:false})
           .setColor('#009933')
           .setTimestamp(); //引数にはDateオブジェクトを入れることができる。何も入れないと今の時間になる
         
         const embed2 = new MessageEmbed()
           .setTitle('シナリオリスト')
           .setDescription('₁₉🧭[【news】](https://discord.com/channels/1085114259425472533/1326859816043413534/1326859822724943914)\n'
                          +'₂₀🗒[【それぞれ目標あり】](https://discord.com/channels/1085114259425472533/1330369614445674517/1330369621978648677)'
                            +'①[HO1](https://discord.com/channels/1085114259425472533/1330372547597828197/1330372553554001931) '
                            +'②[HO2](https://discord.com/channels/1085114259425472533/1330372890301960314/1330372895880515614) '
                            +'③[HO3](https://discord.com/channels/1085114259425472533/1330373430469595279/1330373436299677759) '
                            +'④[HO4](https://discord.com/channels/1085114259425472533/1330373104316448911/1330373110289141770)\n'
                          +'₂₁📈[【特殊能力研究所】](https://discord.com/channels/1085114259425472533/1332906394722107463/1332906397934813288)\n'
                          +'₂₂🥞[【俺を楽しませろ！！！！】](https://discord.com/channels/1085114259425472533/1335230428096888862/1335230433713197187)\n'
                          +'₂₃🌶️[【包まれたシャーデンフロイデ】](https://discord.com/channels/1085114259425472533/1338061026943434857/1338061030583959593)\n'
                          +'₂₄⭐[【友、命あり】](https://discord.com/channels/1085114259425472533/1340525723022131341/1340525731301687348)\n'
                          +'₂₅💠️[【フロストガーデン】](https://discord.com/channels/1085114259425472533/1355532499891261563/1355563417339035672)\n'
                          +'₂₆🛳️[【豪華客船と怪盗団】](https://discord.com/channels/1085114259425472533/1356463331115794563/1356463334488150098)\n'
                          +'₂₇🐍[【全ての蛇の推し】](https://discord.com/channels/1085114259425472533/1363362994402361494/1363362998105673868)\n'
                          +'₂₈🎲[【気狂いに1d100なんて振らせるから】](https://discord.com/channels/1085114259425472533/1356547027185696808/1356547582028943462)\n'
                          +'₂₉🐶[【いなかったから】](https://discord.com/channels/1085114259425472533/1368510246741344296/1368510249652457553)\n'
                          +'₃₀🏠[【悪霊の家2nd】](https://discord.com/channels/1085114259425472533/1380875876790435902/1380876009309732936)\n'
                          +'₃₁🎨[【美の悪魔】](https://discord.com/channels/1085114259425472533/1388352616425324665/1388352623261909193)\n'
                          +'₃₂▪️[【NoTitle】](https://discord.com/channel/1085114259425472533/1264347208527118346)\n'
                          +'₃₃▪️[【NoTitle】](https://discord.com/channel/1085114259425472533/1264347208527118346)\n'
                          +'₃₄▪️[【NoTitle】](https://discord.com/channel/1085114259425472533/1264347208527118346)\n'
                          +'₃₅▪️[【NoTitle】](https://discord.com/channel/1085114259425472533/1264347208527118346)\n'
                          +'₃₆🏜️[【砂の中】](https://discord.com/channel/1085114259425472533/1264347208527118346)\n'
                          )
           .setURL('https://sites.google.com/view/dorecha-plus33421/')
           .addFields({name:'24件中2件を表示',value:'下部ボタンで操作してください',inline:false})
           .setColor('#009933')
           .setTimestamp();
         
         const button1 = new MessageButton()
           .setCustomId("previousbtn") //StyleにLINKを指定した場合ここがURLになる
           .setLabel("前") //表示する文字列
           .setStyle("PRIMARY"); //PRIMARY(青)、SUCCESS(緑)、SECONDARY(灰)、DANGER(銅)、LINK  .setEmoji'絵文字'を使用すると絵文字専用スタイルになる
         
         const button2 = new MessageButton()
           .setCustomId("nextbtn")
           .setLabel("次")
           .setStyle("PRIMARY");
        
         const pages = [
           embed1,
           embed2,
         ];
         const buttonList = [button1, button2];
         const timeout = 0;
         
         paginationEmbed(message, pages, buttonList, timeout);
        
         //message.channel.send({ embeds: [embed名] })　を使用すれば普通の埋め込みになる
       }

    //経済システム @追加受付

        }
      
  //動作テストとかそういうの
  var msgEditVent = /^!button ([\S]+); ([\s\S]+[^;`]); ([\s\S]+[^;`]); ([\s\S\d]*[^;`]);$/;
    if (msgEditVent.test(message.content)) {
      var ctt = message.content;
      var match = msgEditVent.exec(ctt);
      const match3 = match[3] === "null" ? undefined : match[3];
      message.delete();
      message.channel.send(MakeButton(match[1], match[2], match3, match[4]));
    }
  var msgPlusVent = /^!button_add `?(\d+);`? `?([\S]+);`? `?([\s\S]+[^;`]);?`?$/;
    if (msgPlusVent.test(message.content)) {
      var ctt = message.content;
      var match = msgPlusVent.exec(ctt);
      message.delete();
      message.channel.messages.fetch(match[1]).then(editMessage => {
        message.channel.messages.edit(editMessage.content + MakeButton(match[2], match[3]));
      });
    }
  var msgRoleVent = /^!role_create `?([\s\S]+);`? `?([\da-fA-F]{6});?`?$/;
    if (msgRoleVent.test(message.content)){
      var ctt = message.content;
      var match = msgRoleVent.exec(ctt);
      message.delete();
      const makedRole = await message.guild.roles.create({name: match[1], color: match[2]});
      message.channel.send(`${makedRole}を作ったよ。`);
    }
  if (message.content === "d!permissions") {
    const mySelf = message.guild.members.cache.get('1280093631037964321');
    message.delete();
    message.reply(`このサーバーでの${mySelf}:\n${mySelf.permissions.toArray().toString()}`);
  }
      
  if (message.content === "d!test")
    {
      message.channel.sendTyping();
        setTimeout(() =>
          {
            message.channel.send(message.guild.name + ', ' + message.guild + '\n' +
                                 message.channel.name + ', '  + message.channel + '\n' +
                                 message.author.username + ', '  + message.author + '\n' +
                                 message.content + ', ' + message.id + '\n' + 'avatar: ' +
                                 //message.author.displayAvatarURL({ format: 'png' }, { dynamic: false }, { size: 4096 }) + '\n' + 
                                 message.author.avatarURL({ format: 'png', dynamic: false, size: 4096 }));
          
          },300);
    }
  if (message.content === "emj0")
    {
      message.react("<:DR:1315167018537848843>");
      //絵文字ブロックを挿入することでリアクションできる
      message.channel.send("<:DR:1315167018537848843>");
      //<:名前:ID>と入力すると独自の絵文字として認識される
      
    }
  if (message.content === "d!day") {
    message.reply(new Date().getDay()+ "曜日だよ");
  }
      
  if (message.content === "d!emoji pre_4")
    {
      message.react("<:un_A0:1361958245685526659>");
      message.react("<:un_B0:1362370411702124555>");
      message.react("<:un_B1:1361958343454888056>");
      message.react("<:un_C0:1361958308709273711>");
      message.react("<:un_C1:1361966800450883624>"); 
      message.react("<:un_D0:1361969625713213532>");
      message.react("<:un_D1:1361969628972322938>");
      message.react("<:un_E0:1361969630964350976>");     
      //絵文字ブロックを挿入することでリアクションできる
      message.channel.send("<:un_AA:1362004248472064041><:un_AB:1361969623796547674><:un_AC:1361985228037689404><:un_AD:1361985229815812178><:un_AE:1362004250481131550>" +
                           "<:un_A0:1361958245685526659>" +
                           "<:un_B0:1362370411702124555><:un_B1:1361958343454888056>" +
                           "<:un_C0:1361958308709273711><:un_C1:1361966800450883624>" +
                           "<:un_D0:1361969625713213532><:un_D1:1361969628972322938>" +
                           "<:un_E0:1361969630964350976>");
      //<:名前:ID>と入力すると独自の絵文字として認識される
      
    }
  
  //管理者用コマンド
  if (message.author == 1333406768843325442||message.author == 1259826273556107380) {
  //発言
    const msgSendVent = /^d!sen(?:d)?[,\s]([\S\s\r\n]+)$/;
    if (msgSendVent.test(message.content)) {
      message.delete();
      var ctt = message.content;
      var match = msgSendVent.exec(ctt);
      message.channel.send(match[1]);
    }
  //削除
    var msgDeleteVent = /^d!del(?:ete)?[,\s]([\S\s\r\n]+)$/;
    if (msgDeleteVent.test(message.content)) {
      message.delete();
      var ctt = message.content;
      var match = msgDeleteVent.exec(ctt);
      message.channel.messages.delete(match[1]);
    }
  //編集
    var msgEditVent = /^d!edi(?:t)?[,\s]([0-9]+)[,\s]([\S\s\r\n]+)$/;
    if (msgEditVent.test(message.content)) {
      message.delete();
      var ctt = message.content;
      var match = msgEditVent.exec(ctt);
      message.channel.messages.edit(match[1],match[2]);
    }
  //反応
    var msgReactVent = /^d!rea(?:ct)?(?:ion)?[,\s]([0-9]+)[,\s]([\S\s\r\n]+)$/
    if (msgReactVent.test(message.content)) {
      message.delete();
      var ctt = message.content;
      var match = msgReactVent.exec(ctt);
      if (match[2].indexOf("<") != -1) {
        var rematch = match[2].replace(/{/, "<");
        rematch = rematch.replace(/}/, ">");
        message.channel.messages.react(match[1],rematch);
      } else {
        message.channel.messages.react(match[1],match[2]);
      }
      console.log(client.channels.cache.get(String(message.channel.id)).messages.cache.get(String(match[2])));
    }
  //反応削除
    var msgRemoveVent = /^d!rem(?:ove)?[,\s]([\S\s\r\n]+)[,\s]([\S\s\r\n]+)$/
    if (msgRemoveVent.test(message.content)) {
      message.delete();
      var ctt = message.content;
      var match = msgRemoveVent.exec(ctt);
      message.channel.messages.reactions.cache.get(String(match[2])).remove();
    }
    //返信
    var msgReplyVent = /^d!rep(?:ly)?[,\s]([\S\s\r\n]+)[,\s]([\S\s\r\n]+)$/
    if (msgReplyVent.test(message.content)) {
      message.delete();
      var ctt = message.content;
      var match = msgReplyVent.exec(ctt);
      message.channel.messages.reactions.cache.get(String(match[2])).remove();
    }
    //発言
    const msgChangeVent = /^d!cha(?:nge)?[,\s]([\S\s\r\n]+)[,\s]([\S\s\r\n]+)[,\s]([\S\s\r\n]+)$/;
    const msgChangeVentOR = /^msgCha(?:nge)?[,\s]([\S\s\r\n]+)[,\s]([\S\s\r\n]+)$/;
    if (msgChangeVent.test(message.content)) {
      var ctt = message.content;
      var match = msgChangeVent.exec(ctt);
      sendMessage(message, match[1], match[2], match[3]);
      console.log(`${match[1]}\n${match[2]}\n${match[3]}`);
      message.channel.messages.delete(message.id);
    } else if (msgChangeVentOR.test(message.content)) {
      var ctt = message.content;
      var match = msgChangeVentOR.exec(ctt);
      sendMessage(message, match[1], match[2], message.author.avatarURL({ format: 'png', dynamic: false, size: 4096 }));
      console.log(`${match[1]}\n${match[2]}\n${match[3]}`);
      message.channel.messages.delete(message.id);
    }
    //ニックネーム
    const msgNickVent = /^d!nick(?:name)?[,\s]([\S\s\r\n]+)$/;
    if (msgNickVent.test(message.content)) {
      var ctt = message.content;
      var match = msgNickVent.exec(ctt);
      message.guild.members.cache.get(client.user.id).setNickname(match[1]);
      message.channel.messages.delete(message.id);
    }
    
    
    if (message.content === "d!rg_0") {
      message.delete();
      message.channel.send("[loginbonus] 設定解除済みです。");
      ResetRoginBonus();
    }
    if (message.content === "d!rg_1") {
      message.delete();
      message.channel.send(MakeButton('login_bonus', '受け取る', '<:1AgoUn:1330571328482316359>', 'Blue', '今日のログインボーナス'));
    }
    if (message.content === "d!rg_4") {
      message.delete();
      message.channel.send("[loginbonus] 正常値です。");
    }
    if (/^a!(\d+)から(\-?\d+)云徴収/.test(message.content)) {
      const A = /^a!(\d+)から(\-?\d+)云徴収/.exec(message.content);
            
     const search = './moneyger.txt';
      fs.readFile(search, 'utf8', (err, data) => {
          if (err) {
              console.error('エラーが発生しました:', err);
              return;
          }

          // 正規表現を作成
          //const regex = /@[0-9]{17,18}%/g;
          const user = A[1];
          const SearchId = user;
          const regex = new RegExp('\\\n@' + SearchId + '% : -?[0-9]*\\$');
          console.log(SearchId);
          console.log(regex);
          // 一致する文字列を検索
          const matches = data.match(regex);
          console.log(matches);

          if (matches)  ////一致したとき
            {
              console.log('一致した文字列:', matches);
              var matchedStr = matches[0];
              var Before = matchedStr.substr(0, matchedStr.indexOf(':') - 2);
              var UserId = Before.substr(Before.indexOf('@') + 1);
              var After  = matchedStr.substr(matchedStr.indexOf(':') + 2);
              var Points = After.substr(0, After.indexOf('$'));
              console.log(Before);
              console.log(UserId);
              console.log(After);
              console.log(Points);

              const point = A[2]
              const Add = point;
                    Points = Number(Points) - Number(Add);
              const iui = String(message.author.id);
              const ireg = new RegExp('\\n@' + String(iui.substr(0, 10)) + String(iui.substr(10)) + '% : -?[0-9]*\\$');
              const imatch = data.match(ireg);
              console.log(ireg);
              console.log(imatch);
              var imstr = imatch[0];
              var iafter  = imstr.substr(imstr.indexOf(':') + 2);
              var ipoint = iafter.substr(0, iafter.indexOf('$'));
              var Minus = Number(ipoint) + Number(Add);
              console.log(iui);
              console.log(ireg);

                var retxt = '\n@' + SearchId + '% : ' + Points;
                var irt = '\n@' + iui + '% : ' + Minus;
                const newData = data.replace(regex, retxt + '$');
                const newInvent = newData.replace(ireg, irt + '$');
                fs.writeFile('./moneyger.txt', newInvent, 'utf8', (err) => {
                    if (err) {
                        console.error('ファイルの書き込みに失敗しました:', err);
                    } else {
                        console.log('指定したテキストを置き換えました。');
                    }
                });

                message.reply({content: '<@!'+ String(UserId.substr(0, 10))+String(UserId.substr(10))+ '>から'+ Add + uni + '徴収し、' + Points + uni + 'になりました。\n'
                                  + '現在のあなたの所持' + uni + 'は' + Minus + uni + 'です。', flags: MessageFlags.bitfield=4096});

            } else {  ////一致なし
              console.log('一致する文字列はありませんでした。');

              var content = '\n@' + SearchId + '% : ' + '100$';
                fs.appendFile('./moneyger.txt', content, 'utf8', (err) => {
                    if (err) {
                        console.error('エラーが発生しました:', err);
                        return;
                    }
                    console.log('ファイルに追加しました。');
                });
            }

      });
    }

    if (message.content === 'view.server.joined') {
      // サーバーの一覧を取得
      const guilds = client.guilds.cache;

      message.reply(`参加サーバー数: ${guilds.size}`);

      // サーバーの名前とIDを表示
      guilds.forEach(guild => {
        message.reply(`- ${guild.name} (${guild.id})`);
      });
    }
    
    var getrollId = /^gtr <@&(\d+)>$/;
    if (getrollId.test(message.content))
      {
        var ctt = message.content;
        var match = getrollId.exec(ctt);

        const member = message.member; // ユーザーIDを取得
        const roleId = match[1]; // ロールIDを取得
        const role = message.guild.roles.cache.get(roleId);
        
        if (member.roles.cache.has(role.id)) {
          member.roles.remove(role);
          message.channel.send("解除しました。");
        } else {
          member.roles.add(role);
          message.channel.send("設定しました。");
        }
        message.delete();
        
      }
    var makerollId = /^mkr #?([0-9A-Fa-f]{6})$/;
    if (makerollId.test(message.content))
      {
        var ctt = message.content;
        var match = makerollId.exec(ctt);

        const member = message.member; // ユーザーIDを取得
        const rolecolor = match[1]; // ロールカラーを取得
        const makedrole = await message.guild.roles.create({ name: String(message.author.username) + rolecolor, color: rolecolor, position: 12e+75});
        
        makedrole.setPosition(1000); //0=everyone
        console.log(makedrole);
        
        const role = message.guild.roles.cache.get(makedrole.id);
        
        if (member.roles.cache.has(role.id)) {
          member.roles.remove(role);
        } else {
          member.roles.add(role);
        }
        message.delete();
        message.channel.send(`name: ${makedrole.name},\nid: ${makedrole.id}, を作成した`);
      }
    
    var inforollId = /^ifr <@&(\d+)> (\d+)$/;
    if (inforollId.test(message.content))
      {
        var ctt = message.content;
        var match = inforollId.exec(ctt);

        const member = message.member; // ユーザーIDを取得
        const roleId = match[1]; // ロールIDを取得
        const role = message.guild.roles.cache.get(roleId);
        role.setPosition(match[2])
          .then(updated => console.log(`Role position: ${updated.position}`))
          .catch(console.error);
        
        console.log(role);
        message.channel.send(String(role));
        message.delete();
        
      }
    if (message.content === "!赤色") {
        const member = message.member;

        try {
          // Step 1: 役職を作成
          const makedrole = await message.guild.roles.create({
            name: "赤色",
            color: "ff0000",
            position: 1,
            reason: "赤色役職を作成", //監査ログに理由を記録する
          });
          
            message.reply("✅赤色の役職を作成しました。");

          try {
            // Step 2: 役職を一番上に移動
            // 全ての役職を取得し、ソートする。その後、作成した役職を一番上に移動
            const roles = await message.guild.roles.fetch(); // 全ての役職を取得
            const sortedRoles = roles.sort((a, b) => a.position - b.position); // 役職をポジションでソート
            const topRole = sortedRoles.first();
            const newPosition = topRole.position + 1;

            console.debug(newPosition);
            message.reply(String(makedrole.position));
            makedrole.setPosition(newPosition, { reason: "一番上に移動" }) // 理由も付与
                  .catch(error => console.log("並び替えに失敗:", error));
            message.reply(String(makedrole.position));
            makedrole.position = newPosition;

            message.reply("✅役職を並び替えました。");

          } catch (error) {
            console.error("役職の並び替えに失敗しました:", error);
            message.reply("❌役職の移動に失敗しました。");
          }
          
          // Step 3: メンバーに役職を付与
          await member.roles.add(makedrole, "赤色役職を付与"); // 理由も付与

          message.reply("✅赤色の役職を付与しました！"); // 成功を通知

        } catch (error) {
          console.error("役職の作成または移動に失敗しました:", error);
          message.reply("❌役職の作成に失敗しました。"); // 失敗を通知
        }
      }
    if ((/derete/).test(message.content)) {
        message.reaction("❤️")
      }
  }
      
      if (message.channel.id == 1386427307761074268 && message.author.id != 312483399300546562) {
        message.delete();
      }
  //バージョンだしてるだけ(SA)
  var version = process.env.BOT_Version 
  
    }
  
}));

client.on('messageReactionAdd', async (reaction, message) => {
  const embed1 = new MessageEmbed()
  .setDescription('Thank you for using Norieko, please react below to see the command list')

  message.channel.send(embed1).then(function(message) {
   message.react('✅');
  });

  if (reaction.emoji === '✅') {
    const embed2 = new MessageEmbed()
    .setTitle('Commands')
    .addField('Moderation', '`kick`, `ban`, `purge`')
    .addField('Misc', '`meme`, `server`, `user`, `help`')

    message.channel.send(embed2);
  };
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'login_bonus') {
        const search = './moneyger.txt';
        fs.readFile(search, 'utf8', (err, data) => {
            if (err) {
                console.error('エラーが発生しました:', err);
                return;
            }

            // 正規表現を作成
            //const regex = /@[0-9]{17,18}%/g;
            const User = String(interaction.user);
            const SearchId = User.replace(/[<>@]/g, '');
            const regex = new RegExp('\\\n@' + String(SearchId.substr(0, 10)) + String(SearchId.substr(10)) + '% : -?[0-9]*\\$#?');
            console.log(SearchId);
            console.log(regex);
            // 一致する文字列を検索
            const matches = data.match(regex);
            console.log(matches);

            if (matches)  ////一致したとき
              {
                console.log('一致した文字列:', matches);
                var matchedStr = matches[0];
                var Before = matchedStr.substr(0, matchedStr.indexOf(':') - 2);
                var UserId = Before.substr(Before.indexOf('@') + 1);
                var After  = matchedStr.substr(matchedStr.indexOf(':') + 2);
                var Points = After.substr(0, After.indexOf('$'));
                var s = After.substr(After.indexOf('$') + 1);
                console.log(Before);
                console.log(UserId);
                console.log(After);
                console.log(Points);
                console.log(s);
                if (s === '#') {
                  var Logined = true;
                } else {
                  var Logined = false;
                }

                const number = random(1, 150, true);
                let [u1, u2, u3, u4, u5] = Points < 50 ? [ 47, 34, 30, 26, 13 ] :  // *1.3
                                           Points < 100 ? [ 49, 38, 30, 22, 11 ] :  // *1.1
                                           Points < 300 ? [ 50, 40, 30, 20, 10 ] :  // *1.0
                                           [ 51, 42, 30, 18, 9 ];  // *0.9
                
                var point,emoji
                
                if (number > 0 && number < u1) {
                  point = 1;
                  emoji = '<:1AgoUn:1330571328482316359>';
                  console.log(point);
                  
                } else if (number > u1 && number < u1+u2) {
                  point = 2;
                  emoji = '<:2AgoUn:1362369576322596904>';
                  console.log(point);
                  
                } else if (number > u1+u2 && number < u1+u2+u3) {
                  point = 3;
                  emoji = '<:3AgoUn:1330574933855699055>';
                  console.log(point);
                  
                } else if (number > u1+u2+u3 && number < u1+u2+u3+u4) {
                  point = 4;
                  emoji = '<:4AgoUn:1330574620470022254>';
                  console.log(point);
                  
                } else if (number > u1+u2+u3+u4 && number <= u1+u2+u3+u4+u5) {
                  point = 5;
                  emoji = '<:5AgoUn:1362086541652136036>';
                  console.log(point);
                } else {
                  point = 0;
                  emoji = '<:error:1362088977833791510>**_[エラー: ポイントがundefinedです]_**';
                }
                
                if (random(1, 10*100, true) === 1) {
                  point = 30;
                  emoji = '<a:30AgoUn:1362086389427998768>';
                }
                
                var nowTime = DateTime.now().setZone('Asia/Tokyo');
                if (nowTime.month === 3 && (nowTime.day === 15 || nowTime.day === 16)) {
                  console.log(nowTime.month +1, nowTime.day);
                  point *=2;
                }
                if (nowTime.year === 2025 && nowTime.month === 5 && nowTime.day === 26) {
                  point = 5;
                  emoji = '<:5AgoUn:1362086541652136036>';
                  console.log(point);
                }
                
                const Add = point;
                      Points = Number(Points) + Number(Add);
                console.log(Add);
                console.log(Points);
                
                if (Logined === true) {
                  interaction.reply({content: 'ログインボーナスをすでに受け取っています！', ephemeral: true});
                  
                } else if (SearchId != "1105819734630486106" && SearchId != "810073175454122004" && SearchId != "960172159060279377") {
                  var retxt = '\n@' + SearchId + '% : ' + Points;
                const newData = point === 0 ? data.replace(regex, retxt + '$') : data.replace(regex, retxt + '$#');
                console.log(regex, retxt);
                fs.writeFile('./moneyger.txt', newData, 'utf8', (err) => {
                    if (err) {
                        console.error('ファイルの書き込みに失敗しました:', err);
                    } else {
                        console.log('指定したテキストを置き換えました。');
                    }
                    BANK.send({content: `/logbo {user: <@${UserId}>, get: ${Add}}, point: ${Points}}`, flags: MessageFlags.bitfield=4096});
                    interaction.reply(MakeButton('login_share', '結果を共有', '🔃', 'Gray', `${emoji + Add + uni}を獲得した！\n合計: ${Points + uni}`, true));
                  
                  });
                } else {
                    interaction.reply({content: 'あなたはログインボーナスを受け取る資格がないようです :(\nこのサーバー内に複数のアカウントを所持している場合、メインアカウントからアクセスしてください。', ephemeral: true});
                }
                
              } else {  ////一致なし
                console.log('一致する文字列はありませんでした。');

                var content = '\n@' + SearchId + '% : ' + '100$';
                  fs.appendFile('./moneyger.txt', content, 'utf8', (err) => {
                      if (err) {
                          console.error('エラーが発生しました:', err);
                          return;
                      }
                      console.log('ファイルに追加しました。');
                  });
                BANK.send({content: `/bank create {user: <@${UserId}>}, /ago give {user: <@${UserId}>, point: 100}`, flags: MessageFlags.bitfield=4096});
                interaction.reply('そのユーザーには口座が見つからなかったため、口座を作成しました。\n初期所持'+ uni +'は100' + uni +'です');

              }
        });
    }
    if (interaction.customId === 'login_share') {
      var refileMsg = interaction.message.content;
      interaction.deferReply();
      interaction.channel.send({content: `${interaction.user}さんが${refileMsg.substr(0, refileMsg.indexOf('した'))}しました！`, flags: MessageFlags.bitfield=4096});
      interaction.deleteReply();
    }
  
    var giveRoll = /^give_role_(\d+)$/;
    if (giveRoll.test(interaction.customId))
    {
      var match = giveRoll.exec(interaction.customId);
      
      try {
        const member = interaction.member; // ユーザーIDを取得
        const roleId = match[1]; // ロールIDを取得
        console.info(interaction.member);
        const role = interaction.guild.roles.cache.get(roleId);

        if (member.roles.cache.has(role.id)) {
          member.roles.remove(role);
          interaction.reply({content: `${member}の${role}を解除しました。`, ephemeral: true});
        } else {
          member.roles.add(role);
          interaction.reply({content: `${member}に${role}を設定しました。`, ephemeral: true});
        }
      } catch (error) {
        console.error("ロール付与に失敗:", error);
        interaction.reply({content: "ロールが存在しないか、ロールを付与できません。", ephemeral: true});
        //, ephemeral: true
      }
    }
});

module.exports = BANK;

//ここまで

client.login(process.env.BOT_TOKEN);} catch (error) {console.log(error)}