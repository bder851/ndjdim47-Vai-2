const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "owner",
    version: "2.0.0",
    author: "Saidul",
    role: 0,
    shortDescription: "Show owner info with optional Imgur media",
    longDescription: "Show bot owner's details with image/video/audio/gif from Imgur",
    category: "admin",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const owner = {
      name: "AYANOKŌJI KIYOTAKA ",
      nick: "AYANOKOJI ",
      gender: "𝐌𝐀𝐋𝐄",
      age: "17",
      height: "5'7",
      facebook: "https://www.facebook.com/profile.php?id=61558762813083"
    };

    const uptimeSec = process.uptime();
    const h = Math.floor(uptimeSec / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);
    const s = Math.floor(uptimeSec % 60);
    const uptime = `${h}h ${m}m ${s}s`;

    const msg = `
𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎 🧾

• 𝐍𝐀𝐌𝐄: ${owner.name}
• 𝐍𝐈𝐂𝐊: ${owner.nick}
• 𝐆𝐄𝐍𝐃𝐄𝐑: ${owner.gender}
• 𝐀𝐆𝐄: ${owner.age}
• 𝐇𝐄𝐈𝐆𝐇𝐓: ${owner.height}
• 𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊: ${owner.facebook}

⏱ 𝐁𝐎𝐓 𝐔𝐏𝐓𝐈𝐌𝐄: ${uptime}
`;

    // Optional Imgur media link (supports .mp4, .mp3, .jpg, .gif etc)
    const imgurLink = "https://i.imgur.com/cUVzhx7.mp4"; // <-- Change this to your desired Imgur media
    const extension = path.extname(imgurLink).toLowerCase();
    const tempFile = path.join(__dirname, `temp_owner${extension}`);

    try {
      const res = await axios.get(imgurLink, { responseType: "stream" });
      const writer = fs.createWriteStream(tempFile);
      res.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: msg,
            attachment: fs.createReadStream(tempFile)
          },
          event.threadID,
          event.messageID,
          () => fs.unlinkSync(tempFile)
        );
      });

      writer.on("error", (err) => {
        console.error("File write error:", err);
        return api.sendMessage(msg, event.threadID, event.messageID);
      });
    } catch (err) {
      console.error("Media fetch failed:", err.message);
      return api.sendMessage(msg, event.threadID, event.messageID);
    }
  }
};
