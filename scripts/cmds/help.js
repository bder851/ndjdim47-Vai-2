const axios = require("axios");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    aliases: ["use"],
    version: "1.22",
    author: "Ayanokōji",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Explore command usage 📖",
    },
    longDescription: {
      en: "View detailed command usage, list commands by page, or filter by category ✨",
    },
    category: "info",
    guide: {
      en: "🔹 {pn} [pageNumber]\n🔹 {pn} [commandName]\n🔹 {pn} -c <categoryName>",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    try {
      const { threadID } = event;
      const threadData = await threadsData.get(threadID).catch(() => ({}));
      const prefix = getPrefix(threadID) || "!";

      const gifUrls = [
        "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744675711061.gif",
        "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744725103593.gif",
        "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744725081635.gif",
        "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744725040846.gif",
        "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744725005717.gif",
        "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744724982283.gif",
        "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744724955006.gif",
        "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744724925123.gif",
        "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744724902078.gif",
        "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744724841818.gif",
        "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744723932128.gif",
        "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744730505559.gif",
      ];
      const selectedGifUrl = gifUrls[Math.floor(Math.random() * gifUrls.length)];

      const ownerInfo = `╭─『 AYANOKŌJI'S TOOL 』\n` +
        `╰‣ 👑 Admin: Ayanokōji\n` +
        `╰‣ 🤖 Bot Name: Ayanokōji's Tool\n` +
        `╰───────────────◊\n`;

      const footerInfo = (totalCommands) =>
        `╭─『 AYANOKŌJI'S TOOL 』\n` +
        `╰‣ 📋 Total Commands: ${totalCommands}\n` +
        `╰‣ 👑 Admin: Ayanokōji\n` +
        `╰‣ 🌐 IAM FEELINGLESS\n` +
        `╰───────────────◊\n`;

      const getAttachment = async () => {
        try {
          const response = await axios.get(selectedGifUrl, { responseType: "stream" });
          return response.data;
        } catch (error) {
          console.warn("Failed to fetch GIF:", error.message);
          return null;
        }
      };

      // Paginated command list grouped by category
      if (args.length === 0 || !isNaN(args[0])) {
        const categories = {};
        let totalCommands = 0;

        for (const [name, value] of commands) {
          if (value.config.role > role) continue;
          const category = value.config.category?.toLowerCase() || "uncategorized";
          if (!categories[category]) categories[category] = [];
          categories[category].push(name);
          totalCommands++;
        }

        Object.keys(categories).forEach(cat => {
          categories[cat].sort((a, b) => a.localeCompare(b));
        });

        const sortedCategories = Object.keys(categories).sort();
        const page = parseInt(args[0]) || 1;
        const itemsPerPage = 5;
        const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);

        if (page < 1 || page > totalPages)
          return message.reply(`🚫 Invalid page! Please select between 1 and ${totalPages}.`);

        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pagedCategories = sortedCategories.slice(start, end);

        let msg = `✨ [ Command Guide — Page ${page}/${totalPages} ] ✨\n\n` + ownerInfo;

        for (const category of pagedCategories) {
          const cmds = categories[category];
          msg += `╭──── [ ${category.toUpperCase()} ]\n`;
          msg += `│ ✧ ${cmds.join(" ✧ ")}\n`;
          msg += `╰───────────────◊\n`;
        }

        msg += footerInfo(totalCommands);

        const attachment = await getAttachment();
        return await message.reply(attachment ? { body: msg, attachment } : msg);
      }

      // Category-specific
      if (args[0].toLowerCase() === "-c") {
        if (!args[1]) return message.reply("🚫 Please specify a category!");
        const categoryName = args[1].toLowerCase();
        const filteredCommands = Array.from(commands.values()).filter(
          (cmd) => cmd.config.category?.toLowerCase() === categoryName && cmd.config.role <= role
        );

        if (filteredCommands.length === 0)
          return message.reply(`🚫 No commands found in "${categoryName}" category.`);

        const cmdNames = filteredCommands.map(cmd => cmd.config.name).sort((a, b) => a.localeCompare(b));
        let msg = `✨ [ ${categoryName.toUpperCase()} Commands ] ✨\n\n` + ownerInfo;
        msg += `╭──── [ ${categoryName.toUpperCase()} ]\n`;
        msg += `│ ✧ ${cmdNames.join(" ✧ ")}\n`;
        msg += `╰───────────────◊\n`;
        msg += footerInfo(cmdNames.length);

        const attachment = await getAttachment();
        return await message.reply(attachment ? { body: msg, attachment } : msg);
      }

      // Specific command help
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command || command.config.role > role)
        return message.reply(`🚫 Command "${commandName}" not found or restricted.`);

      const configCommand = command.config;
      const roleText = roleTextToString(configCommand.role);
      const author = configCommand.author || "Unknown";
      const longDescription = configCommand.longDescription?.en || "No description";
      const guideBody = configCommand.guide?.en || "No guide available.";
      const usage = guideBody.replace(/{pn}/g, prefix).replace(/{n}/g, configCommand.name);

      let msg = `✨ [ Command: ${configCommand.name.toUpperCase()} ] ✨\n\n`;
      msg += ownerInfo;
      msg += `╭─── 📜 Details ───\n` +
        `│ 🔹 Name: ${configCommand.name}\n` +
        `│ 📝 Description: ${longDescription}\n` +
        `│ 🌐 Aliases: ${configCommand.aliases ? configCommand.aliases.join(", ") : "None"}\n` +
        `│ 🛠 Version: ${configCommand.version || "1.0"}\n` +
        `│ 🔒 Role: ${roleText}\n` +
        `│ ⏳ Cooldown: ${configCommand.countDown || 1}s\n` +
        `│ ✍️ Author: ${author}\n` +
        `╰───────────────◊\n` +
        `╭─── 📚 Usage ───\n` +
        `│ ${usage}\n` +
        `╰───────────────◊\n` +
        `╭─── 📌 Notes ───\n` +
        `│ Customize as needed with ♡ Ayanokōji ♡\n` +
        `╰───────────────◊\n`;
      msg += footerInfo(commands.size);

      const attachment = await getAttachment();
      await message.reply(attachment ? { body: msg, attachment } : msg);
    } catch (error) {
      console.error("Help command error:", error);
      await message.reply("⚠️ An error occurred. Please try again later.");
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "Everyone 😊";
    case 1:
      return "Group Admins 🛡️";
    case 2:
      return "Bot Admins 🔧";
    default:
      return "Unknown ❓";
  }
        }
