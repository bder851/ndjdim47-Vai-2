const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "mj",
    aliases: ["midjourney"],
    version: "3.2",
    author: "Fixed by ChatGPT",
    countDown: 10,
    role: 0,
    shortDescription: "Generate AI images using Midjourney API",
    longDescription: "Use Midjourney API to generate 4 images and select one with U1–U4",
    category: "ai",
    guide: "{pn} <prompt>\nExample: {pn} cat in space"
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt)
      return api.sendMessage("Please enter a prompt.\nExample: mj a dragon dancing in the sky", event.threadID, event.messageID);

    const waitMsg = await api.sendMessage("Generating image, please wait...", event.threadID, event.messageID);

    try {
      const res = await axios.get("https://renzweb.onrender.com/api/mj-6.1", {
        params: {
          prompt,
          apikey: "c464f0a755e3f21fc9dad5a3ae1bfd2b"
        }
      });

      const results = res.data?.results;
      if (!results || results.length !== 4) {
        return api.sendMessage("Error: API did not return 4 images.", event.threadID, waitMsg.messageID);
      }

      const attachments = [];
      const filePaths = [];

      for (let i = 0; i < results.length; i++) {
        const url = results[i];
        const filePath = path.join(__dirname, `cache/mj_${event.senderID}_${i}.jpg`);
        filePaths.push(filePath);

        const img = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(img.data, "binary"));
        attachments.push(fs.createReadStream(filePath));
      }

      api.sendMessage({
        body: `✅ Prompt: "${prompt}"\n\nReply with:\nU1 – Image 1\nU2 – Image 2\nU3 – Image 3\nU4 – Image 4`,
        attachment: attachments
      }, event.threadID, async (err, info) => {
        if (err) console.error("Message send error:", err);

        global.GoatBot.onReply.set(info.messageID, {
          commandName: "mj",
          author: event.senderID,
          images: results
        });

        // Auto cleanup cache after 30 seconds
        setTimeout(() => {
          filePaths.forEach(p => {
            if (fs.existsSync(p)) fs.unlinkSync(p);
          });
        }, 30 * 1000);
      }, waitMsg.messageID);

    } catch (err) {
      console.error("Image generation failed:", err);
      return api.sendMessage("Image generation failed. Please try again later.", event.threadID, waitMsg.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const input = event.body.trim().toUpperCase();
    const index = { U1: 0, U2: 1, U3: 2, U4: 3 }[input];

    if (index === undefined)
      return api.sendMessage("Invalid reply. Use: U1, U2, U3, or U4.", event.threadID, event.messageID);

    try {
      const stream = await global.utils.getStreamFromURL(Reply.images[index]);
      api.sendMessage({
        body: `Here is your selected image (${input})`,
        attachment: stream
      }, event.threadID);
    } catch (err) {
      console.error("Image send error:", err);
      api.sendMessage("Failed to send the image.", event.threadID, event.messageID);
    }
  }
};
