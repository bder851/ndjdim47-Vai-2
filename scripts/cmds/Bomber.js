const axios = require('axios');

module.exports = {
  config: {
    name: "bomber",
    version: "1.0",
    author: "API made by S4B1K and file xnil6x",
    role: 2,
    shortDescription: {
      en: "SMS sending tool"
    },
    longDescription: {
      en: "Send SMS messages to a phone number"
    },
    category: "utility",
    guide: {
      en: "{p}bomber <phone>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      if (!args[0]) {
        return message.reply("❌ Phone number required\nUsage: {p}bomber <phone>");
      }

      const phone = args[0];
      message.reply(`📱 Sending SMS to ${phone}...`);

      const apiUrl = `https://s4b1k-api-ui-v2.onrender.com/api/smsbomber?phone=${phone}`;
      const response = await axios.get(apiUrl);

      if (response.data.success) {
        return message.reply("✅ SMS sent successfully");
      } else {
        return message.reply("❌ Failed to send SMS");
      }

    } catch (error) {
      console.error("Error:", error);
      return message.reply("⚠️ An error occurred");
    }
  }
};
