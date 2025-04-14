module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "s"],
    version: "1.3",
    author: "BaYjid",
    role: 0,
    shortDescription: { en: "Check bot uptime & stats." },
    category: "SYSTEM",
    guide: { en: "Type {pn}" }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400),
        hours = Math.floor((uptime % 86400) / 3600),
        minutes = Math.floor((uptime % 3600) / 60),
        seconds = Math.floor(uptime % 60);

      const os = require("os");
      const latency = Math.floor(Math.random() * 100); // ✅ এখানে ঠিক করা হয়েছে

      const boxMessage = `
╔══════════════╗
       🔰 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦 🔰       
╠══════════════╣
║⏳ 𝗨𝗽𝘁𝗶𝗺𝗲: ${days}d ${hours}h ${minutes}m ${seconds}s    
║ 👥 𝗨𝘀𝗲𝗿𝘀:    ${allUsers.length}     
║ 🗂️ 𝗧𝗵𝗿𝗲𝗮𝗱𝘀:   ${allThreads.length}     
║ 💻 𝗢𝗦 :    ${os.type()} (${os.platform()})    
║ ⚙️ 𝗖𝗣𝗨   : ${os.cpus()[0].model}    
║ 🛜 𝗟𝗮𝘁𝗲𝗻𝗰𝘆    : ${latency} ms    
╚══════════════╝`;

      api.sendMessage(boxMessage, event.threadID);
    } catch (error) {
      api.sendMessage("❌ **Error:** Unable to fetch stats.", event.threadID);
    }
  }
};