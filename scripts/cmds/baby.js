const axios = require('axios');

const baseApiUrl = async () => {
  return "https://www.noobs-api.rf.gd/dipto";
};

module.exports.config = {
  name: "bby",
  aliases: ["baby", "bbe", "babe"],
  version: "6.9.0",
  author: "dipto👽",
  countDown: 0,
  role: 0,
  description: "better than all sim simi",
  category: "CHAT",
  guide: {
    en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nremove [YourMessage] OR\nmsg [YourMessage] OR\nlist OR \nedit [YourMessage] - [NewMessage] OR\nUse --font=2 for different font styles."
  }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
  const link = `${await baseApiUrl()}/baby`;
  let dipto = args.join(" ").toLowerCase();
  const uid = event.senderID;
  let font = "1"; 

  if (dipto.includes("--font=")) {
    const match = dipto.match(/--font=(\d+)/);
    if (match) {
      font = match[1];
      dipto = dipto.replace(match[0], "").trim();
    }
  }

  try {
    if (!args[0]) {
      const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
      return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
    }

    if (dipto === "tmr boss ke") {
      return api.sendMessage("𝐁𝐀𝐘𝐉𝐈𝐃", event.threadID, event.messageID);
    }

    const response = await axios.get(`${link}?text=${dipto}&senderID=${uid}&font=${font}`);
    const replyText = response.data.reply.replace(/rubish/gi, "𝐁𝐀𝐘𝐉𝐈𝐃");

    api.sendMessage(replyText, event.threadID, (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: module.exports.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
        replyText,
        apiUrl: link
      });
    }, event.messageID);
  } catch (e) {
    console.log(e);
    api.sendMessage("Check console for error", event.threadID, event.messageID);
  }
};

module.exports.onReply = async ({ api, event, Reply }) => {
  try {
    if (event.type === "message_reply") {
      const response = await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body?.toLowerCase())}&senderID=${event.senderID}&font=1`);
      const replyText = response.data.reply.replace(/rubish/gi, "Bayjid");

      await api.sendMessage(replyText, event.threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          replyText
        });
      }, event.messageID);
    }
  } catch (err) {
    return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.onChat = async ({ api, event }) => {
  try {
    let body = event.body ? event.body.toLowerCase() : "";
    let font = "1";

    if (body.includes("--font=")) {
      const match = body.match(/--font=(\d+)/);
      if (match) {
        font = match[1];
        body = body.replace(match[0], "").trim();
      }
    }

    if (body.startsWith("baby") || body.startsWith("bby") || body.startsWith("janu")) {
      const arr = body.replace(/^\S+\s*/, "");

      if (!arr) {
        return api.sendMessage("ki hoise 👽🎀", event.threadID, (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID
          });
        }, event.messageID);
      }

      if (arr === "tmr boss ke") {
        return api.sendMessage("𝐁𝐀𝐘𝐉𝐈𝐃", event.threadID, event.messageID);
      }

      const response = await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=${font}`);
      const replyText = response.data.reply.replace(/rubish/gi, "𝐁𝐀𝐘𝐉𝐈𝐃");

      await api.sendMessage(replyText, event.threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          replyText
        });
      }, event.messageID);
    }
  } catch (err) {
    return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};
