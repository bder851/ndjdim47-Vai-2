const axios = require("axios");

module.exports.config = {
  name: "lobon",
  version: "2.0",
  role: 0,
  author: "Ayanokoji",
  description: "Image Generator using Google API with full support",
  category: "𝗜𝗠𝗔𝗚𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥",
  premium: true,
  guide: "{pn} [prompt]\nExample: {pn} cute anime girl",
  countDown: 15,
};

const cache = new Map();

module.exports.onStart = async ({ event, args, api }) => {
  const apiKey = "c464f0a755e3f21fc9dad5a3ae1bfd2b";
  const baseURL = "https://global-redwans-rest-apis.onrender.com/api/google-image-search";
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage("Please provide a prompt for the image.", event.threadID, event.messageID);
  }

  try {
    const waitMessage = await api.sendMessage("Searching image...⌛", event.threadID);
    const url = `${baseURL}?search=${encodeURIComponent(prompt)}&apiKey=${apiKey}`;
    const res = await axios.get(url);

    const images = res.data?.images;
    if (!images || !images.length) {
      return api.sendMessage("No valid images found.", event.threadID, event.messageID);
    }

    // Ensure unique image not sent before for this prompt
    if (!cache.has(prompt)) cache.set(prompt, []);
    const used = cache.get(prompt);
    const available = images.filter(img => !used.includes(img.url));

    if (available.length === 0) {
      cache.set(prompt, []); // reset if all used
      return api.sendMessage("All available images for this prompt were already shown. Try again.", event.threadID, event.messageID);
    }

    const chosen = available[Math.floor(Math.random() * available.length)];
    cache.get(prompt).push(chosen.url); // mark as used

    const imageStream = (await axios.get(chosen.url, { responseType: "stream" })).data;
    await api.sendMessage(
      {
        body: `Here’s your image for: "${prompt}"`,
        attachment: imageStream
      },
      event.threadID,
      event.messageID
    );
    api.unsendMessage(waitMessage.messageID);

  } catch (err) {
    console.error("Error:", err);
    api.sendMessage("An error occurred while fetching the image.", event.threadID, event.messageID);
  }
}; 
