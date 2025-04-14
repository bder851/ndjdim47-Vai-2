const fs = require("fs-extra");
const axios = require("axios");
const { utils } = global;

// Array to store video URLs
const videoUrls = [
    "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744463824966.mp4",
    "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744463771375.mp4",
    "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744463871995.mp4",
    "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744463918587.mp4",
    "http://remakeai-production.up.railway.app/Remake_Ai/Nyx_Remake_1744463956478.mp4",
    // Add more unique video URLs here if desired
];

// Variable to keep track of the last used video index
let lastVideoIndex = -1;

module.exports = {
    config: {
        name: "prefix",
        version: "1.8",
        author: "NTKhang (Modified by AI)",
        countDown: 5,
        role: 0,
        description: "Thay đổi dấu lệnh của bot hoặc xem video chào mừng ngẫu nhiên.",
        category: "config",
        guide: {
            en: "   {pn} <new prefix>: change new prefix in your box chat"
                + "\n   Example:"
                + "\n    {pn} #"
                + "\n\n   {pn} <new prefix> -g: change new prefix in system bot (only admin bot)"
                + "\n   Example:"
                + "\n    {pn} # -g"
                + "\n\n   {pn} reset: change prefix in your box chat to default"
                + "\n\n   {pn}: Sends a welcome message with a random video."
        }
    },

    langs: {
        en: {
            reset: "✅ Your prefix has been reset to default: %1",
            onlyAdmin: "⚠️ Only admin can change prefix of system bot",
            confirmGlobal: "❗ Please react to this message to confirm changing the system bot prefix.",
            confirmThisThread: "❗ Please react to this message to confirm changing the prefix in your box chat.",
            successGlobal: "✅ Changed system bot prefix to: %1",
            successThisThread: "✅ Changed prefix in your box chat to: %1",
            thanksInvite: "━━━━━━━━━━━━━━━━━━━\n" +
                         "🌍 𝐒𝐲𝐬𝐭𝐞𝐦 𝐏𝐫𝐞𝐟𝐢𝐱: %1\n" +
                         "💬 𝐘𝐨𝐮𝐫 𝐆𝐫𝐨𝐮𝐩 𝐏𝐫𝐞𝐟𝐢𝐱: %2\n" +
                         "⏰ 𝐒𝐞𝐫𝐯𝐞𝐫 𝐓𝐢𝐦𝐞: %3\n" +
                         "━━━━━━━━━━━━━━━━━━━\n" +
                         "💡 𝐓𝐨 𝐮𝐬𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬, 𝐭𝐲𝐩𝐞 ➜ *help 𝐭𝐨 𝐬𝐞𝐞 𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬!\n" +
                         "━━━━━━━━━━━━━━━━━━━\n" +
                         "📹 𝐖𝐚𝐭𝐜𝐡 𝐭𝐡𝐢𝐬 𝐯𝐢𝐝𝐞𝐨:",
            errorVideoOnly: "🔴 Sorry, couldn't fetch the video this time."
        }
    },

    // Helper function to send welcome message and video
    sendWelcomeVideo: async function({ message, getLang, threadsData, event }) {
        try {
            // Get the current prefix for the thread or default to global config prefix
            const threadPrefix = await threadsData.get(event.threadID, "data.prefix") || global.GoatBot.config.prefix;
            // Get current date and time
            const currentDateTime = new Date().toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).replace(',', '');

            // Use global system prefix and thread prefix
            const welcomeText = getLang("thanksInvite", global.GoatBot.config.prefix, threadPrefix, currentDateTime);

            // Check if there are any videos in the array
            if (videoUrls.length === 0) {
                return message.reply(welcomeText + "\n(No videos configured)");
            }

            // Select a random index different from the last one
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * videoUrls.length);
            } while (randomIndex === lastVideoIndex && videoUrls.length > 1);

            // Update lastVideoIndex
            lastVideoIndex = randomIndex;

            const randomVideoUrl = videoUrls[randomIndex];

            const response = await axios.get(randomVideoUrl, { responseType: 'stream' });
            const videoStream = response.data;

            // Send welcome text and video stream together
            await message.reply({
                body: welcomeText,
                attachment: videoStream
            });
        } catch (error) {
            console.error("Error fetching/sending welcome video:", error);
            // If video fetch fails, send the welcome text with an error note
            await message.reply(welcomeText + "\n" + getLang("errorVideoOnly"));
        }
    },

    onStart: async function (args) {
        const { message, role, args: commandArgs, commandName, event, threadsData, getLang } = args;

        // If no arguments are provided (e.g., just ".prefix")
        if (!commandArgs[0]) {
            await this.sendWelcomeVideo({ message, getLang, threadsData, event });
            return;
        }

        // Handle the "reset" argument
        if (commandArgs[0].toLowerCase() === 'reset') {
            try {
                await threadsData.set(event.threadID, null, "data.prefix");
                return message.reply(getLang("reset", global.GoatBot.config.prefix));
            } catch (e) {
                console.error("Error resetting prefix:", e);
                return message.reply("❌ An error occurred while resetting the prefix.");
            }
        }

        // --- Logic for setting a new prefix ---
        const newPrefix = commandArgs[0];
        if (!newPrefix || /\s/.test(newPrefix)) {
            return message.reply("❌ Prefix cannot be empty or contain spaces.");
        }

        const formSet = {
            commandName,
            author: event.senderID,
            newPrefix
        };

        if (commandArgs[1] === "-g") {
            if (role < 2) {
                return message.reply(getLang("onlyAdmin"));
            }
            formSet.setGlobal = true;
        } else {
            formSet.setGlobal = false;
        }

        return message.reply(formSet.setGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
            if (err) {
                console.error("Error sending confirmation:", err);
                return message.reply("❌ Could not send confirmation message.");
            }
            formSet.messageID = info.messageID;
            global.GoatBot.onReaction.set(info.messageID, formSet);
        });
    },

    onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
        const { author, newPrefix, setGlobal } = Reaction;
        if (event.userID !== author) return;

        try {
            if (setGlobal) {
                global.GoatBot.config.prefix = newPrefix;
                fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
                return message.reply(getLang("successGlobal", newPrefix));
            } else {
                await threadsData.set(event.threadID, newPrefix, "data.prefix");
                return message.reply(getLang("successThisThread", newPrefix));
            }
        } catch (e) {
            console.error("Error applying prefix change:", e);
            return message.reply("❌ An error occurred while changing the prefix.");
        } finally {
            global.GoatBot.onReaction.delete(Reaction.messageID);
        }
    },

    onChat: async function (args) {
        const { event, message, getLang, threadsData } = args;
        if (event.body && event.body.toLowerCase() === "prefix") {
            await this.sendWelcomeVideo({ message, getLang, threadsData, event });
            return;
        }
    }
};
