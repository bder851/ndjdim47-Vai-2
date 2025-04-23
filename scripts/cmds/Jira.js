const axios = require("axios");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const tinyurl = require("tinyurl");

module.exports = {
  config: {
    name: "jira",
    version: "2.3",
    author: "Ayanokoji (Fixed by ChatGPT)",
    countDown: 20,
    role: 0,
    shortDescription: { en: "Anime image + 4K upscale" },
    longDescription: { en: "Generate anime image from prompt or image, upscale to 4K" },
    category: "image",
    guide: { en: "{p}jira [prompt] | reply to image" }
  },

  onStart: async function ({ api, event, args, message }) {
    api.setMessageReaction("🎨", event.messageID, () => {}, true);

    try {
      let imageUrl = null;
      let prompt = "";

      if (event.type === "message_reply") {
        const attachment = event.messageReply.attachments?.[0];
        if (!attachment || !["photo", "sticker"].includes(attachment.type)) {
          return message.reply("Please reply to an image or sticker.");
        }

        const imgBuffer = await global.utils.downloadFile(attachment.url);
        const processedBuffer = await sharp(imgBuffer)
          .removeAlpha()
          .resize({ width: 512 })
          .toFormat("png", { compressionLevel: 9, quality: 100, effort: 10 })
          .normalize()
          .toBuffer();

        const tempPath = path.join(__dirname, "noglitch.png");
        fs.writeFileSync(tempPath, processedBuffer);
        imageUrl = await global.utils.uploadImage(tempPath);
        fs.unlinkSync(tempPath);
      } else if (args.length > 0 && args[0].startsWith("http")) {
        imageUrl = args[0];
      } else if (args.length > 0) {
        prompt = args.join(" ").trim();
      } else {
        return message.reply("Please provide a prompt or reply to an image.");
      }

      if (imageUrl) {
        const shortUrl = await tinyurl.shorten(imageUrl);
        const promptRes = await axios.get(`https://www.api.vyturex.com/describe?url=${encodeURIComponent(shortUrl)}`);
        prompt = promptRes.data;
      }

      const genRes = await axios.get(`https://text2image-wine.vercel.app/kshitiz?prompt=${encodeURIComponent(prompt)}&model=1`);
      const task_id = genRes.data.task_id;
      const progressUrl = `https://progress-black.vercel.app/progress?imageid=${task_id}`;

      let imgDownloadLink = null;
      let attempt = 0;

      while (!imgDownloadLink && attempt < 10) {
        const { data } = await axios.get(progressUrl);
        if (data?.data?.status === 2 && data.data.imgs?.length > 0) {
          imgDownloadLink = data.data.imgs[0];
        } else {
          await new Promise(res => setTimeout(res, 5000));
          attempt++;
        }
      }

      if (!imgDownloadLink) {
        return message.reply("❌ Image generation timed out. Try again later.");
      }

      const upscale = await axios.get(`https://smfahim.onrender.com/4k?url=${encodeURIComponent(imgDownloadLink)}`);
      const finalImageUrl = upscale.data.image;

      const imgStream = await global.utils.getStreamFromURL(finalImageUrl, "jira-upscaled.png");
      return message.reply({
        body: `✅ Generated from: "${prompt}"`,
        attachment: imgStream
      });

    } catch (err) {
      console.error("JIRA Error:", err);
      return message.reply("❌ Something went wrong, try again later.");
    }
  }
};
