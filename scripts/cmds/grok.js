const axios = require("axios");
const { Readable } = require("stream");

module.exports.config = {
  name: "grok",
  version: "5.3",
  role: 0,
  author: "Ayanokoji",
  description: "Combined Image Generator & Chatbot command",
  category: "IMAGE & CHAT",
  premium: true,
  guide: "{pn} -i [prompt] → Generate Image\n{pn} [prompt] → Chatbot reply",
  countDown: 10
};

module.exports.onStart = async ({ event, args, api }) => {
  const imageApi = "https://renzweb.onrender.com/api/grok-2-image";
  const chatApi = "https://renzweb.onrender.com/api/grok2";
  const apiKey = "c464f0a755e3f21fc9dad5a3ae1bfd2b";
  const senderID = event.senderID;

  try {
    if (args.length === 0) {
      return api.sendMessage("Please provide a prompt.", event.threadID, event.messageID);
    }

    let isImage = false;
    if (args[0] === "-i") {
      isImage = true;
      args.shift();
    }

    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("Please provide a prompt after -i.", event.threadID, event.messageID);
    }

    if (isImage) {
      const waitMessage = await api.sendMessage("Processing your request...⌛", event.threadID);

      const res = await axios.get(
        `${imageApi}?prompt=${encodeURIComponent(prompt)}&apiKey=${encodeURIComponent(apiKey)}`,
        { responseType: "stream" }
      );

      if (res.headers["content-type"]?.includes("image")) {
        await api.unsendMessage(waitMessage.messageID);
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        await api.sendMessage(
          {
            body: `Here's your generated image for: "${prompt}"`,
            attachment: res.data
          },
          event.threadID,
          event.messageID
        );
      } else {
        const chunks = [];
        for await (const chunk of res.data) chunks.push(chunk);
        const text = Buffer.concat(chunks).toString("utf8");

        let json;
        try {
          json = JSON.parse(text);
        } catch (err) {
          await api.unsendMessage(waitMessage.messageID);
          return api.sendMessage("Error: Unable to parse API response.", event.threadID, event.messageID);
        }

        const url = json.url || json.image || json.imageUrl || json.result;
        if (!url) {
          await api.unsendMessage(waitMessage.messageID);
          return api.sendMessage("Error: No valid image found in response.", event.threadID, event.messageID);
        }

        const imageRes = await axios.get(url, { responseType: "stream" });
        await api.unsendMessage(waitMessage.messageID);
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        await api.sendMessage(
          {
            body: `Here's your generated image for: "${prompt}"`,
            attachment: imageRes.data
          },
          event.threadID,
          event.messageID
        );
      }
    } else {
      const res = await axios.get(
        `${chatApi}?prompt=${encodeURIComponent(prompt)}&uid=${encodeURIComponent(senderID)}`
      );

      let replyText = "";
      if (typeof res.data === "object") {
        replyText = res.data.reply || "No reply provided.";
      } else if (typeof res.data === "string") {
        replyText = res.data;
      } else {
        replyText = "Unexpected chatbot response.";
      }

      await api.sendMessage(replyText, event.threadID, event.messageID);
    }
  } catch (error) {
    console.error("Error in grok command:", error.response ? { status: error.response.status, data: error.response.data } : error.message);
    api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
  }
};
