const fs = require("fs");
const path = require("path");
const axios = require("axios");
const tinyurl = require("tinyurl");
const sharp = require("sharp");

module.exports = {
  config: {
    name: "jira",
    aliases: [],
    version: "2.2",
    author: "Ayanokoji (Fixed by ChatGPT)",
    countDown: 20,
    role: 0,
    shortDescription: "Anime image + 4K upscale",
    longDescription: "Generate anime-style image from prompt or replied image and upscale it to 4K without glitches.",
    category: "𝗜𝗠𝗔𝗚𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥",
    guide: {
      en: "{p}jira [prompt] | reply to image"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    api.setMessageReaction("🎨", event.messageID, () => {}, true);

    try {
      let imageUrl = null;
      let prompt = "";

      // If image is replied
      if (event.type === "message_reply") {
        const attachment = event.messageReply.attachments[0];
        if (!attachment || !["photo", "sticker"].includes(attachment.type)) {
          return message.reply("Please reply to a valid image.");
        }

        const imgBuffer = await global.utils.downloadFile(attachment.url);
        const processedBuffer = await sharp(imgBuffer)
          .removeAlpha()
          .resize({ width: 512 })
          .toFormat("png", { compressionLevel: 9, quality: 100, effort: 10 })
          .normalize()
          .toBuffer();

        const tempPath = path.join(__dirname, "temp_noglitch.png");
        fs.writeFileSync(tempPath, processedBuffer);
        const uploadUrl = await global.utils.uploadImage(tempPath);
        fs.unlinkSync(tempPath);
        imageUrl = uploadUrl;
      }

      // If direct image URL
      else if (args.length > 0 && args[0].startsWith("http")) {
        imageUrl = args[0];
      }

      // If prompt provided
      else if (args.length > 0) {
        prompt = args.join(" ").trim();
      }

      else {
        return message.reply("Please reply to an image or provide a valid prompt.");
      }

      // Generate prompt if image used
      if (imageUrl) {
        const shortUrl = await tinyurl.shorten(imageUrl);
        const promptResponse = await axios.get(`https://www.api.vyturex.com/describe?url=${encodeURIComponent(shortUrl)}`);
        prompt = promptResponse.data;
      }

      // Generate image from prompt
      const promptApiUrl = `https://text2image-wine.vercel.app/kshitiz?prompt=${encodeURIComponent(prompt)}&model=1`;
      const { data: { task_id } } = await axios.get(promptApiUrl);

      const progressApiUrl = `https://progress-black.vercel.app/progress?imageid=${task_id}`;
      let imgDownloadLink = null;

      while (!imgDownloadLink) {
        const { data: { data: progress } } = await axios.get(progressApiUrl);
        if (progress.status === 2 && progress.imgs && progress.imgs.length > 0) {
          imgDownloadLink = progress.imgs[0];
        }
        await new Promise(res => setTimeout(res, 5000));
      }

      // Upscale to 4K
      const upscaledUrl = `https://smfahim.onrender.com/4k?url=${encodeURIComponent(imgDownloadLink)}`;
      const { data: { image: finalImageUrl } } = await axios.get(upscaledUrl);

      const attachment = await global.utils.getStreamFromURL(finalImageUrl, "animagine-final-4k.png");
      await message.reply({
        body: `✅ Anime-style image generated from: "${prompt}"`,
        attachment
      });

    } catch (err) {
      console.error("Error:", err.message || err);
      message.reply("❌ | Something went wrong. Try again later.");
    }
  }
};
