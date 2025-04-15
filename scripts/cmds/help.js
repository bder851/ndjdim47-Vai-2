const axios = require("axios");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    aliases: ["use"],
    version: "1.21",
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
      const prefix = getPrefix(threadID) || "!"; // Fallback prefix
      const commandsPerPage = 25;
      const gifUrl = "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744675711061.gif";

      // Owner info
      const ownerInfo = `╭─『 AYANOKŌJI'S TOOL 』\n` +
                        `╰‣ 👑 Admin: Ayanokōji\n` +
                        `╰‣ 🤖 Bot Name: Ayanokōji's Tool\n` +
                        `╰───────────────◊\n`;

      // Footer info with Facebook and Messenger links
      const footerInfo = (totalCommands, page, totalPages) => 
                        `╭─『 AYANOKŌJI'S TOOL 』\n` +
                        `╰‣ 📋 Total Commands: ${totalCommands}\n` +
                        `╰‣ 📄 Page: ${page}/${totalPages}\n` +
                        `╰‣ 👑 Admin: Ayanokōji\n` +
                        `╰‣ 🌐 IAM FEELINGLESS \n` +
                        `╰───────────────◊\n`;

      // Function to fetch GIF as a stream
      const getAttachment = async () => {
        try {
          const response = await axios.get(gifUrl, { responseType: "stream" });
          return response.data;
        } catch (error) {
          console.warn("Failed to fetch GIF:", error.message);
          return null; // Return null if GIF fetch fails
        }
      };

      if (args.length === 0 || !isNaN(args[0])) {
        // Paginated command list
        const page = parseInt(args[0]) || 1;
        const categories = {};
        let allCommands = [];

        // Filter and group commands by category
        for (const [name, value] of commands) {
          if (value.config.role > role) continue; // Skip commands user can't access
          allCommands.push({ name, config: value.config });
          const category = value.config.category?.toLowerCase() || "uncategorized";
          categories[category] = categories[category] || { commands: [] };
          categories[category].commands.push(name);
        }

        // Sort commands
        allCommands = allCommands.sort((a, b) => a.name.localeCompare(b.name));

        // Pagination logic
        const totalCommands = allCommands.length;
        const totalPages = Math.ceil(totalCommands / commandsPerPage);
        const startIndex = (page - 1) * commandsPerPage;
        const endIndex = startIndex + commandsPerPage;

        if (page < 1 || page > totalPages) {
          return message.reply(`🚫 Invalid page! Choose between 1 and ${totalPages}.`);
        }

        let msg = `✨ [ Guide For Beginners - Page ${page} ] ✨\n\n`;
        msg += ownerInfo;

        // Display commands by category for the current page
        Object.keys(categories).sort().forEach((category) => {
          const categoryCommands = categories[category].commands.sort();
          const displayCommands = categoryCommands.filter((cmd) => {
            const cmdIndex = allCommands.findIndex((c) => c.name === cmd);
            return cmdIndex >= startIndex && cmdIndex < endIndex;
          });

          if (displayCommands.length > 0) {
            msg += `╭──── [ ${category.toUpperCase()} ]\n`;
            msg += `│ ✧ ${displayCommands.join(" ✧ ")}\n`;
            msg += `╰───────────────◊\n`;
          }
        });

        if (totalCommands === 0) {
          msg = "🚫 No commands available for your role.";
        }

        msg += footerInfo(totalCommands, page, totalPages);

        // Send response with optional GIF
        const attachment = await getAttachment();
        await message.reply(attachment ? { body: msg, attachment } : msg);
      } else if (args[0].toLowerCase() === "-c") {
        // Category-specific commands
        if (!args[1]) {
          return message.reply("🚫 Please specify a category!");
        }

        const categoryName = args[1].toLowerCase();
        const filteredCommands = Array.from(commands.values()).filter(
          (cmd) => cmd.config.category?.toLowerCase() === categoryName && cmd.config.role <= role
        );

        if (filteredCommands.length === 0) {
          return message.reply(`🚫 No commands found in "${categoryName}" category.`);
        }

        let msg = `✨ [ ${categoryName.toUpperCase()} Commands ] ✨\n\n`;
        msg += ownerInfo;
        msg += `╭──── [ ${categoryName.toUpperCase()} ]\n`;
        filteredCommands.sort((a, b) => a.config.name.localeCompare(b.config.name)).forEach((cmd) => {
          msg += `│ ✧ ${cmd.config.name}\n`;
        });
        msg += `╰───────────────◊\n`;
        msg += footerInfo(filteredCommands.length, 1, 1);

        // Send response with optional GIF
        const attachment = await getAttachment();
        await message.reply(attachment ? { body: msg, attachment } : msg);
      } else {
        // Specific command help
        const commandName = args[0].toLowerCase();
        const command = commands.get(commandName) || commands.get(aliases.get(commandName));

        if (!command || command.config.role > role) {
          return message.reply(`🚫 Command "${commandName}" not found or restricted.`);
        }

        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";
        const longDescription = configCommand.longDescription?.en || "No description";
        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

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
        msg += footerInfo(commands.size, 1, 1);

        // Send response with optional GIF
        const attachment = await getAttachment();
        await message.reply(attachment ? { body: msg, attachment } : msg);
      }
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
