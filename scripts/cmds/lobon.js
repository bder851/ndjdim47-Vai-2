const axios = require("axios");
const https = require("https");

module.exports.config = {
  name: "lobon",
  version: "2.5",
  role: 2,
  author: "Ayanokoji",
  description: "Image Generator using Google API with all image type support",
  category: "𝗜𝗠𝗔𝗚𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥",
  premium: true,
  guide: "{pn} [prompt]\nExample: {pn} realistic anime girl",
  countDown: 10,
};

const cache = new Map();
const agent = new https.Agent({ rejectUnauthorized: false }); // allow all SSL certs

module.exports.onStart = async ({ event, args, api }) => {
  const apiKey = "c464f0a755e3f21fc9dad5a3ae1bfd2b";
  const baseURL = "https://global-redwans-rest-apis.onrender.com/api/google-image-search";
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage("Type something to search!\nExample: *google anime girl", event.threadID, event.messageID);
  }

  try {
    const wait = await api.sendMessage("Searching image...⌛", event.threadID);
    const url = `${baseURL}?search=${encodeURIComponent(prompt)}&apiKey=${apiKey}`;

    const res = await axios.get(url, { httpsAgent: agent });
    console.log("API Response:", res.data); // Debugging
    const images = res.data?.images;

    if (!images || !images.length) {
      return api.sendMessage("No image found for your search.", event.threadID, event.messageID);
    }

    if (!cache.has(prompt)) cache.set(prompt, []);
    const used = cache.get(prompt);
    const available = images.filter(img => !used.includes(img.url));

    if (available.length === 0) {
      cache.set(prompt, []);
      return api.sendMessage("You've seen all images for this search. Try again!", event.threadID, event.messageID);
    }

    const chosen = available[Math.floor(Math.random() * available.length)];
    cache.get(prompt).push(chosen.url);

    try {
      const stream = (await axios.get(chosen.url, {
        responseType: "stream",
        httpsAgent: agent,
        headers: {
          "User-Agent": "Mozilla/5.0" // prevent 403 from some image URLs
        }
      })).data;

      api.unsendMessage(wait.messageID);
      await api.sendMessage(
        {
          body: `🖼 Result for: "${prompt}"`,
          attachment: stream
        },
        event.threadID,
        event.messageID
      );

    } catch (imgErr) {
      console.error("Image stream error:", imgErr?.response?.data || imgErr.message);
      return api.sendMessage("Image found but failed to load. Try another one.", event.threadID, event.messageID);
    }

  } catch (err) {
    console.error("Image error:", err?.response?.data || err.message);
    return api.sendMessage("Error loading image. Try a different keyword or later.", event.threadID, event.messageID);
  }
};
