module.exports = {
  config: {
    name: "top",
    aliases: ["top"],
    version: "1.0",
    author: "saidul",
    role: 0,
    shortDescription: { en: "Top 30 Rich Users" },
    longDescription: { en: "Displays the top 30 richest users in terms of money with formatted values" },
    category: "group",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    function a(a) {
      return a >= 1e9 ? (a / 1e9).toFixed(2) + " b" : a >= 1e6 ? (a / 1e6).toFixed(2) + " m" : a >= 1e3 ? (a / 1e3).toFixed(2) + " k" : a.toString();
    }

    const b = await usersData.getAll(),
      c = b.sort((b, c) => c.money - b.money).slice(0, 15),
      d = c.map((b, c) => `${c + 1}. ${b.name}: ☞ ${a(b.money)} 💲`),
      e = ` 𝚃𝙾𝙿 15 𝚁𝙸𝙲𝙷𝙴𝚂𝚃 𝚄𝚂𝙴𝚁𝚂 💰\n \n${d.join('\n \n')}\n\n🌟𝙺𝚎𝚎𝚙 𝚎𝚊𝚛𝚗𝚒𝚗𝚐 𝚝𝚘 𝚌𝚕𝚒𝚖𝚋 𝚝𝚑𝚎 𝚛𝚊𝚗𝚔𝚜🌟`;
    
    message.reply(e);
  }
};
