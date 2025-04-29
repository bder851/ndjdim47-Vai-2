const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports.config = {
  name: "fluxultra",
  version: "1.9",
  role: 0,
  author: "MahMUD",
  category: "Image gen",
  guide: 
`{pn} [prompt] --ratio 1:1
{pn} [prompt] --ratio 16:9
{pn} [prompt] --ratio 9:16
{pn} [prompt] --ratio 4:5
{pn} [prompt] --ratio 5:4
{pn} [prompt] --ratio 3:2
{pn} [prompt] --ratio 2:3
{pn} [prompt] --ratio 21:9`,
  countDown: 10,
};

module.exports.onStart = async ({ event, args, api }) => {
  try {
    const input = args.join(" ");
    const [rawPrompt, ratioInput] = input.includes("--ratio")
      ? input.split("--ratio").map(s => s.trim())
      : [input, "1:1"];

    const ratio = ratioInput.replace("x", ":");
    const randomSuffix = Math.random().toString(36).substring(7);
    const prompt = `${rawPrompt || "A beautiful fantasy forest"} --${randomSuffix}`;

    const waitMessage = await api.sendMessage("I am trying to help you 🗿mr", event.threadID);
    api.setMessageReaction("👀", event.messageID, () => {}, true);

    const response = await axios({
      method: "POST",
      url: `${await baseApiUrl()}/api/fluxultra`,
      data: { prompt, ratio },
      responseType: "stream"
    });

    api.setMessageReaction("🗿", event.messageID, () => {}, true);
    api.unsendMessage(waitMessage.messageID);

    api.sendMessage({
      body: "🗿 | Here's your image baby",
      attachment: response.data
    }, event.threadID, event.messageID);

  } catch (error) {
    console.error(error.message);
    api.sendMessage("❌ " + error.message, event.threadID, event.messageID);
  }
};
