 const axios = require('axios');

const config = {
  name: "roast",
  version: "2.0.0",
  author: "nYx",
  credits: "nYx",
  description: "AI-powered chat using falcon",
  category: "AI",
  commandCategory: "falcon AI",
  usePrefix: true,
  prefix: true,
  dependencies: {
    "axios": "",
  },
};

const onStart = async ({ message, event, args, commandName }) => {
  const input = args.join(' ');
  await handleResponse({ message, event, input, commandName });
};

const onReply = async ({ message, event, Reply, args, commandName }) => {
  if (event.senderID !== Reply.author) return;
  
  const input = args.join(' ');
  await handleResponse({ message, event, input, commandName });
};

async function handleResponse({ message, event, input, commandName }) {
  try {
const response = await axios.get(`https://roaster-roaster.up.railway.app/bully?prompt=${input}&style=6`)
    const data = response.data;
    
    return message.reply(data, (err, info) => {
      if (!err) {
        // GoatBot reply
        if (global.GoatBot && global.GoatBot.onReply) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID
          });
        }
        
        // Mirai Bot 
        if (global.client && global.client.handleReply) {
          global.client.handleReply.push({
            name: config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID
          });
        }
      }
    });
  } catch (e) {
    message.reply(`Error: ${e.message}`);
  }
}

module.exports = {
  config,
  onStart,
  onReply,
  run: onStart,
  handleReply: onReply,
};
