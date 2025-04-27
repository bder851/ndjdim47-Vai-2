const hideWord = word => word.replace(/[\w]/g, "*");

module.exports = {
  config: {
    name: "badwords",
    aliases: ["badword"],
    version: "1.5",
    author: "NTKhang & Modified by You",
    countDown: 5,
    role: 1,
    description: {
      en: "Warn users for bad words, kick on second violation"
    },
    category: "box chat"
  },

  onStart: async function ({ message, event, args, threadsData, usersData, role }) {
    if (!await threadsData.get(event.threadID, "data.badWords"))
      await threadsData.set(event.threadID, {
        words: [],
        violationUsers: {}
      }, "data.badWords");

    const badWords = await threadsData.get(event.threadID, "data.badWords.words", []);
    const violationUsers = await threadsData.get(event.threadID, "data.badWords.violationUsers", {});

    switch (args[0]) {
      case "add": {
        if (role < 1) return message.reply("Only admin can add bad words.");
        const words = args.slice(1).join(" ").split(/[,|]/).map(w => w.trim()).filter(w => w.length >= 2);
        if (!words.length) return message.reply("Please provide words to add.");

        let added = [], existed = [];
        for (const word of words) {
          if (badWords.includes(word)) existed.push(word);
          else added.push(word) && badWords.push(word);
        }
        await threadsData.set(event.threadID, badWords, "data.badWords.words");
        return message.reply(`Added: ${added.join(", ")}\nAlready Exist: ${existed.join(", ")}`);
      }

      case "delete":
      case "del": {
        if (role < 1) return message.reply("Only admin can delete bad words.");
        const words = args.slice(1).join(" ").split(/[,|]/).map(w => w.trim());
        if (!words.length) return message.reply("Please provide words to delete.");

        let deleted = [], notExist = [];
        for (const word of words) {
          const index = badWords.indexOf(word);
          if (index !== -1) {
            badWords.splice(index, 1);
            deleted.push(word);
          } else notExist.push(word);
        }
        await threadsData.set(event.threadID, badWords, "data.badWords.words");
        return message.reply(`Deleted: ${deleted.join(", ")}\nNot Found: ${notExist.join(", ")}`);
      }

      case "list": {
        if (!badWords.length) return message.reply("No bad words set.");
        return message.reply(`Bad words:\n${badWords.join(", ")}`);
      }

      case "on": {
        if (role < 1) return message.reply("Only admin can enable.");
        await threadsData.set(event.threadID, true, "settings.badWords");
        return message.reply("Bad words protection enabled.");
      }

      case "off": {
        if (role < 1) return message.reply("Only admin can disable.");
        await threadsData.set(event.threadID, false, "settings.badWords");
        return message.reply("Bad words protection disabled.");
      }

      case "unwarn": {
        if (role < 1) return message.reply("Only admin can unwarn.");
        let userID = event.messageReply?.senderID || Object.keys(event.mentions)[0] || args[1];
        if (!userID || isNaN(userID)) return message.reply("Please tag or enter userID.");

        if (!violationUsers[userID]) return message.reply("User has no warnings.");
        violationUsers[userID]--;
        if (violationUsers[userID] <= 0) delete violationUsers[userID];
        await threadsData.set(event.threadID, violationUsers, "data.badWords.violationUsers");
        const userName = await usersData.getName(userID);
        return message.reply(`Removed 1 warning from ${userName}.`);
      }

      default:
        return message.reply("Invalid command usage.");
    }
  },

  onChat: async function ({ message, event, api, threadsData }) {
    if (!event.body) return;
    const threadData = global.db.allThreadData.find(t => t.threadID === event.threadID) || await threadsData.create(event.threadID);
    if (!threadData.settings.badWords) return;

    const badWords = threadData.data.badWords?.words || [];
    const violationUsers = threadData.data.badWords?.violationUsers || {};

    for (const word of badWords) {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      if (regex.test(event.body)) {
        violationUsers[event.senderID] = (violationUsers[event.senderID] || 0) + 1;
        await threadsData.set(event.threadID, violationUsers, "data.badWords.violationUsers");

        if (violationUsers[event.senderID] === 1) {
          return message.reply(`Warning: You used a banned word "${hideWord(word)}". One more and you will be kicked.`);
        }
        if (violationUsers[event.senderID] >= 2) {
          await message.reply(`You have been kicked for repeated bad words: "${hideWord(word)}".`);
          try {
            await api.removeUserFromGroup(event.senderID, event.threadID);
          } catch (e) {
            console.error(e);
            await message.reply("Bot needs admin rights to kick members.");
          }
          violationUsers[event.senderID] = 0;
          await threadsData.set(event.threadID, violationUsers, "data.badWords.violationUsers");
        }
        return;
      }
    }
  }
};
