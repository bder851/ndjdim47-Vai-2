const axios = require("axios");
const https = require("https");

module.exports.config = {
  name: "lobon",
  version: "3.1",
  role: 2,
  author: "Ayanokoji + Modified by ChatGPT",
  description: "Image Generator using Google API with retry fallback system",
  category: "𝗜𝗠𝗔𝗚𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥",
  premium: true,
  guide: "{pn} [prompt]\nExample: {pn} realistic anime girl",
  countDown: 10,
};

const agent = new https.Agent({ rejectUnauthorized: false });
const cache = new Map();

module.exports.onStart = async ({ event, args, api }) => {
  const apiKey = "c464f0a755e3f21fc9dad5a3ae1bfd2b";
  const baseURL = "https://global-redwans-rest-apis.onrender.com/api/google-image-search";
  const prompt = args.join(" ").trim();

  if (!prompt) return api.sendMessage("Type something to search!\nExample: *google anime girl", event.threadID, event.messageID);

  const wait = await api.sendMessage("Searching image...⌛", event.threadID);

  try {
    const res = await axios.get(`${baseURL}?search=${encodeURIComponent(prompt)}&apiKey=${apiKey}`, { httpsAgent: agent });
    const images = res.data?.images?.filter(img => img.url?.startsWith("http"));

    if (!images || !images.length) {
      return api.sendMessage("No image found for your search.", event.threadID, event.messageID);
    }

    if (!cache.has(prompt)) cache.set(prompt, []);
    let used = cache.get(prompt);
    let available = images.filter(img => !used.includes(img.url));

    if (!available.length) {
      used = [];
      available = images;
      cache.set(prompt, []);
    }

    let chosenUrl = null;
    let imageStream = null;

    for (let i = 0; i < available.length; i++) {
      const candidate = available[i];
      try {
        const stream = await axios.get(candidate.url, {
          responseType: "stream",
          httpsAgent: agent,
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        imageStream = stream.data;
        chosenUrl = candidate.url;
        break;
      } catch (err) {
        console.log("Image failed to load, trying next...");
        continue;
      }
    }

    await api.unsendMessage(wait.messageID);

    if (!imageStream) {
      return api.sendMessage("All found images failed to load. Try again later.", event.threadID, event.messageID);
    }

    cache.get(prompt).push(chosenUrl);

    return api.sendMessage({
      body: `🖼 Result for: "${prompt}"`,
      attachment: imageStream
    }, event.threadID, event.messageID);

  } catch (err) {
    console.error("API Error:", err?.response?.data || err.message);
    return api.sendMessage("Error fetching image. Try again later.", event.threadID, event.messageID);
  }
};
