const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "moric",
    version: "1.0",
    author: "Redwan - xnil",
    countDown: 20,
    role: 2,
    shortDescription: {
      en: "Generate AI art using MidJourney prompt"
    },
    longDescription: {
      en: "Create stunning AI-generated images with a prompt using MidJourney's engine."
    },
    category: "image",
    guide: {
      en: "{pn} <prompt>"
    }
  },
  
  onStart: async function({ message, args, event }) {
    const prompt = args.join(" ").trim();
    if (!prompt) return message.reply("Please provide a prompt.");
    
    message.reply("🦍 Generating your MidJourney image. Please wait...");
    
    try {
      const url = `https://mjunlimited.onrender.com/gen?prompt=${encodeURIComponent(prompt)}&api_key=xnil6xxx11`;
      const res = await axios.get(url);
      
      if (!res.data?.success || !res.data?.combined_img || !res.data?.original_images) {
        return message.reply("❌ Image generation failed. Try again later.");
      }
      
      const collageStream = await getStreamFromURL(res.data.combined_img);
      const images = res.data.original_images;
      
      message.reply(
        {
          body: "🎨 Here's your generated image collage. Reply with 1, 2, 3, or 4 to view individual images.",
          attachment: collageStream
        },
        (err, info) => {
          if (err) return console.error(err);
          
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            images
          });
        }
      );
    } catch (err) {
      console.error("MidJourney API error:", err);
      return message.reply("❌ An error occurred while generating the image. Please try again later.");
    }
  },
  
  onReply: async function({ event, message, Reply, args }) {
    const { author, images, messageID } = Reply;
    
    if (event.senderID !== author) {
      return message.reply("🚫 Only the original requester can select images.");
    }
    
    const num = parseInt(event.body.trim());
    if (isNaN(num) || num < 1 || num > images.length) {
      return message.reply(`⚠️ Please reply with a number between 1 and ${images.length}.`);
    }
    
    try {
      const imageStream = await getStreamFromURL(images[num - 1]);
      return message.reply({
        body: `🖼️ Here is your selected image (${num}/${images.length}):`,
        attachment: imageStream
      });
    } catch (err) {
      console.error("Image retrieval error:", err);
      return message.reply("❌ Failed to load the selected image. Please try again.");
    } finally {
      global.GoatBot.onReply.delete(messageID);
    }
  }
}; 
