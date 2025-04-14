const { getTime, drive } = global.utils;

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.0",
		author: "BaYjid",
		category: "events"
	},

	langs: {
		vi: {
			session1: "☀ 𝗦𝗮́𝗻𝗴",
			session2: "⛅ 𝗧𝗿𝘂̛𝗮",
			session3: "🌆 𝗖𝗵𝗶𝗲̂̀𝘂",
			session4: "🌙 𝗧𝗼̂́𝗶",
			welcomeMessage: "✨ 𝗖𝗮̉𝗺 𝗼̛𝗻 𝗯𝗮̣𝗻 𝗱𝗮̃ 𝗺𝗼̛̀𝗶 𝘁𝗼̂𝗶 𝘃𝗮̀𝗼 𝗻𝗵𝗼́𝗺!\n⚡ 𝗣𝗿𝗲𝗳𝗶𝘅 𝗯𝗼𝘁: %1\n🔎 Đ𝗲̂̉ 𝘅𝗲𝗺 𝗱𝗮𝗻𝗵 𝘀𝗮́𝗰𝗵 𝗹𝗲̣̂𝗻𝗵 𝗵𝗮̃𝘆 𝗻𝗵𝗮̣̂𝗽: %1help",
			multiple1: "🔹 𝗕𝗮̣𝗻",
			multiple2: "🔹 𝗖𝗮́𝗰 𝗯𝗮̣𝗻",
			defaultWelcomeMessage: "🎉 𝗖𝗵𝗮̀𝗼 𝗺𝘂̛̀𝗻𝗴 {userName} 🎊\n\n🚀 𝗖𝗵𝗮̀𝗼 𝗺𝘂̛̀𝗻𝗴 𝗯𝗮̣𝗻 𝗱𝗲̂́𝗻 𝘃𝗼̛́𝗶 『 {boxName} 』\n🔹 𝗖𝗵𝘂́𝗰 𝗯𝗮̣𝗻 𝗰𝗼́ 𝗯𝘂𝗼̂̉𝗶 {session} 𝘃𝘂𝗶 𝘃𝗲̉! ✨"
		},
		en: {
			session1: "☀ 𝓜𝓸𝓻𝓷𝓲𝓷𝓰",
			session2: "⛅ 𝓝𝓸𝓸𝓷",
			session3: "🌆 𝓐𝓯𝓽𝓮𝓻𝓷𝓸𝓸𝓷",
			session4: "🌙 𝓔𝓿𝓮𝓷𝓲𝓷𝓰",
			welcomeMessage: "🎀𝗠𝗮𝗹𝘃𝗶𝗻𝗮🎀\n\n🚀 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝗶𝗻𝘃𝗶𝘁𝗶𝗻𝗴 𝗺𝗲!\n⚡ 𝗕𝗼𝘁 𝗣𝗿𝗲𝗳𝗶𝘅: %1\n🔎 𝗧𝗼 𝗰𝗵𝗲𝗰𝗸 𝗮𝗹𝗹 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀, 𝘁𝘆𝗽𝗲: %1help\n\n✨ 𝗛𝗮𝘃𝗲 𝗮 𝗴𝗿𝗲𝗮𝘁 𝘁𝗶𝗺𝗲! ✨",
			multiple1: "🔹 𝖸𝗈𝗎",
			multiple2: "🔹 𝖸𝗈𝗎 𝖦𝗎𝗒𝗌",
			defaultWelcomeMessage: "🎉 『 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 』 🎉\n\n💠 𝗛𝗲𝘆 {userName}!\n🔹 𝗬𝗼𝘂 𝗷𝘂𝘀𝘁 𝗷𝗼𝗶𝗻𝗲𝗱 『 {boxName} 』\n⏳ 𝗧𝗶𝗺𝗲 𝗳𝗼𝗿 𝘀𝗼𝗺𝗲 𝗳𝘂𝗻! 𝗛𝗮𝘃𝗲 𝗮 𝗳𝗮𝗻𝘁𝗮𝘀𝘁𝗶𝗰 {session} 🎊\n\n⚠ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗳𝗼𝗹𝗹𝗼𝘄 𝗮𝗹𝗹 𝗴𝗿𝗼𝘂𝗽 𝗿𝘂𝗹𝗲𝘀! 🚀"
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType !== "log:subscribe") return;

		const { threadID, logMessageData } = event;
		const { addedParticipants } = logMessageData;
		const hours = getTime("HH");
		const prefix = global.utils.getPrefix(threadID);
		const nickNameBot = global.GoatBot.config.nickNameBot;

		if (addedParticipants.some(user => user.userFbId === api.getCurrentUserID())) {
			if (nickNameBot) api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
			return message.send(getLang("welcomeMessage", prefix));
		}

		if (!global.temp.welcomeEvent[threadID]) {
			global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };
		}

		global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...addedParticipants);

		clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

		global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
			const threadData = await threadsData.get(threadID);
			if (threadData.settings.sendWelcomeMessage === false) return;

			const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
			const bannedUsers = threadData.data.banned_ban || [];
			const threadName = threadData.threadName;

			let userNameList = [], mentions = [];
			let isMultiple = dataAddedParticipants.length > 1;

			for (const user of dataAddedParticipants) {
				if (bannedUsers.some(banned => banned.id === user.userFbId)) continue;
				userNameList.push(user.fullName);
				mentions.push({ tag: user.fullName, id: user.userFbId });
			}

			if (userNameList.length === 0) return;

			let welcomeMessage = threadData.data.welcomeMessage || getLang("defaultWelcomeMessage");

			welcomeMessage = welcomeMessage
				.replace(/\{userName\}|\{userNameTag\}/g, userNameList.join(", "))
				.replace(/\{boxName\}|\{threadName\}/g, threadName)
				.replace(/\{multiple\}/g, isMultiple ? getLang("multiple2") : getLang("multiple1"))
				.replace(/\{session\}/g, 
					hours <= 10 ? getLang("session1") :
					hours <= 12 ? getLang("session2") :
					hours <= 18 ? getLang("session3") : getLang("session4")
				);

			let form = { body: welcomeMessage, mentions: welcomeMessage.includes("{userNameTag}") ? mentions : null };

			if (threadData.data.welcomeAttachment) {
				const files = threadData.data.welcomeAttachment;
				const attachments = files.map(file => drive.getFile(file, "stream"));

				form.attachment = (await Promise.allSettled(attachments))
					.filter(({ status }) => status === "fulfilled")
					.map(({ value }) => value);
			}

			message.send(form);
			delete global.temp.welcomeEvent[threadID];
		}, 1500);
	}
};
