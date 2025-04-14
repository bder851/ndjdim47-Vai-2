const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    aliases: ["use",],
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
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);
    const commandsPerPage = 50;

    // Owner info with emojis
    const ownerInfo = `╭─── 🌟 Ayanokōji's Tool 🌟 ───\n` +
                     `│ 👑 Admin: Ayanokōji\n` +
                     `│ 🤖 Bot Name: Ayanokōji's Tool\n` +
                     `╰───────────────────✨\n`;

    // Footer info with flair
    const footerInfo = (totalCommands, page, totalPages) => 
                     `╭─── ℹ️ Info ───\n` +
                     `│ 🌟 Ayanokōji's Tool\n` +
                     `│ 📋 Total Commands: ${totalCommands}\n` +
                     `│ 📄 Page: ${page}/${totalPages}\n` +
                     `│ 💬 Personal FB Bot\n` +
                     `│ 👑 Admin: Ayanokōji\n` +
                     `│ ❓ Type *${prefix}help [commandName]* for details!\n` +
                     `╰───────────────────✨\n`;

    if (args.length === 0 || !isNaN(args[0])) {
      // Paginated command list
      const page = parseInt(args[0]) || 1;
      const categories = {};
      let allCommands = [];

      // Filter commands by role
      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        allCommands.push({ name, config: value.config });
        const category = value.config.category || "Uncategorized";
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
        await message.reply(`🚫 Invalid page! Choose between 1 and ${totalPages}.`);
        return;
      }

      let msg = `✨ [ Command Guide - Page ${page} ] ✨\n\n`;
      msg += ownerInfo;

      // Group commands by category
      const pageCommands = allCommands.slice(startIndex, endIndex);
      const pageCategories = {};

      for (const cmd of pageCommands) {
        const category = cmd.config.category || "Uncategorized";
        pageCategories[category] = pageCategories[category] || { commands: [] };
        pageCategories[category].commands.push(cmd.name);
      }

      // Display categories and commands
      Object.keys(pageCategories).forEach((category) => {
        msg += `╭─── 📂 ${category.toUpperCase()} ───\n`;
        const names = pageCategories[category].commands.sort();
        names.forEach((item) => {
          msg += `│ ➤ ${item}\n`;
        });
        msg += `╰───────────────✨\n`;
      });

      msg += footerInfo(totalCommands, page, totalPages);

      await message.reply({ body: msg });
    } else if (args[0] === "-c") {
      // Category-specific commands
      if (!args[1]) {
        await message.reply("🚫 Please specify a category!");
        return;
      }

      const categoryName = args[1].toLowerCase();
      const filteredCommands = Array.from(commands.values()).filter(
        (cmd) => cmd.config.category?.toLowerCase() === categoryName
      );

      if (filteredCommands.length === 0) {
        await message.reply(`🚫 No commands found in "${categoryName}" category.`);
        return;
      }

      let msg = `✨ [ ${categoryName.toUpperCase()} Commands ] ✨\n\n`;
      msg += ownerInfo;
      msg += `╭─── 📂 ${categoryName.toUpperCase()} ───\n`;
      filteredCommands.forEach((cmd) => {
        msg += `│ ➤ ${cmd.config.name}\n`;
      });
      msg += `╰───────────────✨\n`;
      msg += footerInfo(commands.size, 1, 1);

      await message.reply(msg);
    } else {
      // Specific command help
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`🚫 Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";

        const longDescription = configCommand.longDescription
          ? configCommand.longDescription.en || "No description"
          : "No description";

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
               `╰───────────────✨\n` +
               `╭─── 📚 Usage ───\n` +
               `│ ${usage}\n` +
               `╰───────────────✨\n` +
               `╭─── 📌 Notes ───\n` +
               `│ Customize as needed with ♡ Ayanokōji ♡\n` +
               `╰───────────────✨\n`;
        msg += footerInfo(commands.size, 1, 1);

        await message.reply(msg);
      }
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
