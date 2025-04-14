module.exports = {

  config: {

    name: "botinfo",

    aliases: ["info","btinfo"],

    version: "1.0",

    author: "Ayanokoji",

    role: 0,

    shortDescription: {

      en: "Get the Bot information such as uptime, ping, and group info."

    },

    longDescription: {

      en: "Get the Bot information such as uptime, ping, and group info."

    },

    category: "Info",

    guide: {

      en: "{pn}"

    }

  },

  onStart: async function ({ api, event, args, usersData, threadsData }) {

    try {

      

      // Group info

      let threadInfo = await api.getThreadInfo(event.threadID);

      var memLength = threadInfo.participantIDs.length;

      let threadMem = threadInfo.participantIDs.length;

      var nameMen = [];

      var gendernam = [];

      var gendernu = [];

      var nope = [];

      for (let z in threadInfo.userInfo) {

     	var gioitinhone = threadInfo.userInfo[z].gender;

     	var nName = threadInfo.userInfo[z].name;

        if(gioitinhone == "MALE"){gendernam.push(z+gioitinhone)}

        else if(gioitinhone == "FEMALE"){gendernu.push(gioitinhone)}

            else{nope.push(nName)}

      };

      var nam = gendernam.length;

      var nu = gendernu.length;

      var listad = '';

      var qtv2 = threadInfo.adminIDs;

      let qtv = threadInfo.adminIDs.length;

      let sl = threadInfo.messageCount;

      let u = threadInfo.nicknames;

      let icon = threadInfo.emoji;

      let threadName = threadInfo.threadName;	

      let id = threadInfo.threadID;

      for (let i = 0; i < qtv2.length; i++) {

      const infu = (await api.getUserInfo(qtv2[i].id));

      const name = infu[qtv2[i].id].name;

		listad += '•' + name + '\n';

		}

		   

      const allUsers = await usersData.getAll();

      const allThreads = await threadsData.getAll();

      

      // uptime

      const uptime = process.uptime();

      const hours = Math.floor(uptime / 3600);

      const minutes = Math.floor((uptime % 3600) / 60);

      const seconds = Math.floor(uptime % 60);

      // ping

      const timeStart = Date.now();

      await api.sendMessage("𝗖𝗵𝗲𝗰𝗸𝗶𝗻𝗴 𝗕𝗼𝘁'𝘀 𝗜𝗻𝗳𝗼.", event.threadID);

      const ping = Date.now() - timeStart;

      

      const uptimeString = `${hours}Hrs ${minutes}min ${seconds}sec`;

      

      api.sendMessage(`╭────────────────⭓
├─「𝐔𝐏𝐓𝐈𝐌𝐄」
│» 𝗕𝗼𝘁 𝗥𝘂𝗻𝗻𝗶𝗻𝗴 𝗶𝗻 
│${uptimeString}.
├────────────────
├─「𝐏𝐈𝐍𝐆」
│» 𝗧𝗵𝗲 𝗖𝘂𝗿𝗿𝗲𝗻𝘁 𝗣𝗶𝗻𝗴 𝗜𝘀:
│${ping}ms.
├────────────────
├─「𝐆𝐑𝐎𝐔𝐏 𝐈𝐧𝐟𝐨」
│» 𝗚𝗖 𝗡𝗮𝗺𝗲: 
│${threadName}
│» 𝗚𝗿𝗼𝘂𝗽 𝗜𝗗: 
│${id}
│» 𝗡𝘂𝗺𝗯𝗲𝗿 𝗼𝗳 𝗠𝗲𝗺𝗯𝗲𝗿:
│${threadMem}
│» 𝗡𝘂𝗺𝗯𝗲𝗿 𝗼𝗳 𝗠𝗮𝗹𝗲:
│${nam}
│» 𝗡𝘂𝗺𝗯𝗲𝗿 𝗼𝗳 𝗙𝗲𝗺𝗮𝗹𝗲:
│${nu}
│» 𝗡𝘂𝗺𝗯𝗲𝗿 𝗼𝗳 𝗔𝗱𝗺𝗶𝗻: 
│${qtv}
│𝗡𝘂𝗺𝗯𝗲𝗿 𝗼𝗳 𝗠𝗲𝘀𝘀𝗮𝗴𝗲𝘀:
│${sl}
╰────────────────⭓`, event.threadID);

    } catch (error) {

      console.error(error);

      api.sendMessage("An error occurred while retrieving data.", event.threadID);

    }

  }

};
