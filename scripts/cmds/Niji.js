const axios = require("axios");

module.exports = {
  config: {
    name: "niji",
    aliases: [],
    version: "1.0",
    author: "ডালিং",
    countDown: 10,
    role: 0,
    shortDescription: "Anime photo by prompt",
    longDescription: "Generate Niji anime image from text prompt",
    category: "ai",
    guide: "{pn} [prompt]"
  },

  onStart: async function ({ message, args }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("প্রম্পট দে ভাই, না দিলে ছবি বানাম কেমনে?");

    message.reply("wait কোরো baby 🐥, Niji ছবি বানতেছে...");

    try {
      const res = await axios.get(`https://renzweb.onrender.com/api/niji-v6?prompt=${encodeURIComponent(prompt)}&key=c464f0a755e3f21fc9dad5a3ae1bfd2b`);

      if (!res.data || !res.data.url) {
        return message.reply("ছবি বানাইতে পারি নাই ভাই... API-টা বুইষা দেখ।");
      }

      const imgStream = await axios.get(res.data.url, { responseType: "stream" });

      message.reply({
        body: "তোর Niji anime photo রেডি!",
        attachment: imgStream.data
      });

    } catch (err) {
      console.error("Niji command error:", err.message);
      message.reply("অই ভাই, একটা সমস্যা হইছে! Server নাকি বেগুন খাইছে!");
    }
  }
};
