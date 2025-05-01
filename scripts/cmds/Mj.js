const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "niji",
    aliases: ["anime"],
    version: "1.3",
    author: "ডালিং Special",
    shortDescription: "Generate anime-style art with Niji-v5",
    longDescription: "Creates 4 anime-style AI images using the Niji-v5 model from MidJourney",
    category: "AI",
    role: 2,
    guide: {
      en: "{p}niji <your anime-style prompt>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const prompt = args.join(" ");
      if (!prompt) {
        return message.reply("Please provide a prompt. Example: {p}niji anime girl with sword");
      }

      await message.reply("🎨 Generating anime-style images with Niji-v5...");

      const response = await axios.get(`https://renzweb.onrender.com/api/niji-v5?prompt=${encodeURIComponent(prompt)}`);
      const imageUrls = response.data?.results;

      if (!Array.isArray(imageUrls) || imageUrls.length !== 4) {
        return message.reply("❌ Failed to generate images. Invalid API response:\n" + JSON.stringify(response.data, null, 2));
      }

      const imgPaths = [];
      for (let i = 0; i < imageUrls.length; i++) {
        const imgPath = path.join(__dirname, `niji_${Date.now()}_${i}.jpg`);
        const res = await axios.get(imageUrls[i], { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, Buffer.from(res.data, "binary"));
        imgPaths.push(imgPath);
      }

      const msg = await message.reply({
        body: `✨ Niji-v5 Anime Art\n\nPrompt: "${prompt}"\n\nReply with:\nU1 - Image 1\nU2 - Image 2\nU3 - Image 3\nU4 - Image 4`,
        attachment: imgPaths.map(p => fs.createReadStream(p))
      });

      // Register reply
      global.GoatBot.onReply.set(msg.messageID, {
        commandName: "niji",
        author: event.senderID,
        imgPaths
      });

      // Delete images after 2 mins
      setTimeout(() => {
        imgPaths.forEach(p => {
          try { fs.unlinkSync(p); } catch {}
        });
      }, 2 * 60 * 1000);

    } catch (err) {
      console.error("Error:", err);
      return message.reply(`❌ Error: ${err.message}`);
    }
  },

  onReply: async function ({ api, event, Reply, message }) {
    const { author, imgPaths } = Reply;

    if (event.senderID !== author) return;

    const choice = event.body.toUpperCase().trim();

    const map = { U1: 0, U2: 1, U3: 2, U4: 3 };

    if (!map.hasOwnProperty(choice)) return message.reply("❌ Invalid option. Reply with U1, U2, U3, or U4.");

    const selectedImg = fs.createReadStream(imgPaths[map[choice]]);
    return message.reply({
      body: `✅ Here's your selected image (${choice})`,
      attachment: selectedImg
    });
  }
};
