const axios = require("axios");

module.exports = {
  config: {
    name: "mj",
    aliases: ["midjourney"],
    version: "2.1",
    author: "xnil6x",
    shortDescription: "Generate 4 MidJourney AI art variations",
    longDescription: "Create 4 AI-generated image variations using MidJourney's algorithm",
    category: "AI",
    role: 2,
    guide: {
      en: "{p}mj <prompt>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const apiUrl = "  https://mjunlimited.onrender.com/gen"; // Replace with actual API endpoint
      const apiKey = "xnil6xxx"; // Replace with your actual API key

      const prompt = args.join(" ");
      if (!prompt) {
        return message.reply("Please provide a prompt. Example: {p}mj beautiful sunset");
      }

      await message.reply("🔄 Generating 4 AI art variations...");

      const response = await axios.get(`${apiUrl}?prompt=${encodeURIComponent(prompt)}&api_key=${apiKey}`);

      const x = response.data?.image_data.info.imageUrl;
      
      if (!x || x.length !== 4) {
        return message.reply("❌ Failed to generate images. The API response was invalid.");
      }

      // Download all images simultaneously
      const imageStreams = await Promise.all(
        x.map(url => global.utils.getStreamFromURL(url))
      );

      return message.reply({
        body: `🎨 Generated 4 Variations\n\nPrompt: "${prompt}"\n\nChoose your favorite!`,
        attachment: imageStreams
      });

    } catch (err) {
      console.error("Error:", err);
      return message.reply(`❌ Failed to generate images. Error: ${err.message}`);
    }
  }
};
