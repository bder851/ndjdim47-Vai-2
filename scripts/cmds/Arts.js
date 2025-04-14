const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "sketch",
  aliases: ["sktch", "arts"],
  version: "1.6.9",
  author: "Nazrul",
  usePrefix: false,
  role: 2,
  description: "Generate unique sketch image",
  category: "image",
  countDown: 3,
  guide: {
    en: "{pn} write a prompt"
  }
};

module.exports.onStart = async ({ api, event, args }) => {
  const prompt = args.join(" ");
  if (!prompt) {
    return api.sendMessage("Please provide a prompt", event.threadID, event.messageID);
  }

  const startTime = Date.now();

  try {
    const res = await axios.get(`${global.GoatBot.config.mostakim}/m/artSketch?prompt=${encodeURIComponent(prompt)}`);
    const imageUrl = res.data.imgUrl;

    const imageResponse = await axios({
      url: imageUrl,
      responseType: 'arraybuffer'
    });

    const imagePath = path.join(__dirname, "image.png");

    fs.writeFileSync(imagePath, Buffer.from(imageResponse.data));

    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

    await api.sendMessage({
      body: `✅✨ Here's Your Sketch image✨\n\n✨Prompt: ♡ ${prompt} ♡\n💫 Process time: ♡ ${timeTaken} seconds ♡\n`,
      attachment: fs.createReadStream(imagePath)
    }, event.threadID, event.messageID);

    fs.unlinkSync(imagePath);

  } catch (error) {
    await api.sendMessage(`💔 Error: ${error.message}`, event.threadID, event.messageID);
  }
};
