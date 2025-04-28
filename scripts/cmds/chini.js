module.exports = {
	config: {
		name: "chini",
		version: "1.0",
		author: "Team Calyx",
		countDown: 10,
		role: 0,
		shortDescription: {
			en: "Generate AI images based on prompts"
		},
		longDescription: {
			en: "Generate AI images using various styles and aspect ratios"
		},
		category: "𝗜𝗠𝗔𝗚𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥",
		guide: {
			en: "{pn} <prompt> [--ar <ratio>] [--s <styleNumber>]\n\n" +
				"Available styles:\n" +
				"1: realistic\n" +
				"2: metallic\n" +
				"3: pixar\n" +
				"4: anime\n" +
				"5: pixelated\n" +
				"6: ink\n" +
				"7: illustration\n" +
				"8: flat\n" +
				"9: minimalistic\n" +
				"10: doodle\n" +
				"11: cartoonish\n" +
				"12: watercolor\n" +
				"13: origami\n" +
				"14: 3d\n" +
				"15: vector\n" +
				"16: handdrawn\n" +
				"17: natgeo\n\n" +
				"Available aspect ratios:\n" +
				"1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9\n\n" +
				"Examples:\n" +
				"• {pn} cute girl\n" +
				"• {pn} cute girl --ar 16:9\n" +
				"• {pn} cute girl --s 4\n" +
				"• {pn} cute girl --ar 3:4 --s 12"
		}
	},

	onStart: async function ({ api, args, message, event }) {
		const prompt = args.join(" ");
		
		if (!prompt) {
			return message.reply("Please enter a prompt to generate an image");
		}

		let aspectRatio = "1:1";
		let style = "realistic";
		
		const ratioIndex = args.indexOf("--ar");
		if (ratioIndex !== -1 && args[ratioIndex + 1]) {
			const validRatios = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9"];
			const ratio = args[ratioIndex + 1];
			if (validRatios.includes(ratio)) {
				aspectRatio = ratio;
			} else {
				return message.reply("Invalid aspect ratio. Available ratios: 1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9");
			}
		}

		const styleIndex = args.indexOf("--s");
		if (styleIndex !== -1 && args[styleIndex + 1]) {
			const styleNumber = parseInt(args[styleIndex + 1]);
			const styleNames = [
				"realistic", "metallic", "pixar", "anime", "pixelated", 
				"ink", "illustration", "flat", "minimalistic", "doodle", 
				"cartoonish", "watercolor", "origami", "3d", "vector", 
				"handdrawn", "natgeo"
			];
			
			if (styleNumber >= 1 && styleNumber <= 17) {
				style = styleNames[styleNumber - 1];
			} else {
				return message.reply("Invalid style number. Available styles:\n1: realistic\n2: metallic\n3: pixar\n4: anime\n5: pixelated\n6: ink\n7: illustration\n8: flat\n9: minimalistic\n10: doodle\n11: cartoonish\n12: watercolor\n13: origami\n14: 3d\n15: vector\n16: handdrawn\n17: natgeo");
			}
		}

		try {
			

			api.setMessageReaction("⏳", event.messageID, () => {}, true);
			
			const cleanPrompt = prompt.replace(/--ar\s+\S+|--s\s+\S+/g, "").trim();
			const apiUrl = `http://185.128.227.86:6091/api/aigen?prompt=${encodeURIComponent(cleanPrompt)}&style=${style}&imageRatio=${aspectRatio}`;
			
		
			await message.reply({
				attachment: await global.utils.getStreamFromURL(apiUrl)
			});
			
	api.setMessageReaction("✅", event.messageID, () => {}, true);
		} catch (error) {
			console.error(error);
			
			api.setMessageReaction("❌", event.messageID, () => {}, true);
			message.reply("An error occurred while generating the image");
		}
	}
}; 
