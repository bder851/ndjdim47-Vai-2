module.exports = {
  config: {
    name: "ttt",
    version: "1.0",
    author: "Rafi",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Play Tic Tac Toe with bot or mentioned user" },
    longDescription: { en: "Play a game of Tic Tac Toe against the bot or another mentioned user." },
    category: "games",
    guide: { en: "{pn} @mention or {pn} bot" }
  },

  onStart: async function ({ message, event, args, usersData }) {
    const mention = Object.keys(event.mentions)[0];
    const isVsBot = args[0] === "bot";
    const player1 = event.senderID;
    const player2 = isVsBot ? "BOT" : mention;

    if (!isVsBot && !mention) {
      return message.reply("Please mention someone or use `ttt bot` to play with bot.");
    }

    const board = Array(9).fill('⬜');
    const displayBoard = getBoard(board);

    const player1Name = await getName(usersData, player1);
    const player2Name = isVsBot ? "Bot" : await getName(usersData, player2);

    message.reply({
      body: `⭕ ${player1Name} vs ❌ ${player2Name}\n\n${displayBoard}\n\nReply with a number (1–9) to make your move.`,
    }, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "ttt",
        messageID: info.messageID,
        board,
        currentPlayer: player1,
        player1,
        player2,
        isVsBot,
        usersData
      });
    });
  },

  onReply: async function ({ message, event, Reply }) {
    const { board, currentPlayer, player1, player2, isVsBot, usersData } = Reply;
    const senderID = event.senderID;

    if (senderID !== currentPlayer) return;

    const index = parseInt(event.body) - 1;
    if (isNaN(index) || index < 0 || index > 8 || board[index] !== '⬜') {
      return message.reply("Invalid move. Choose a number (1–9) in an empty cell.");
    }

    board[index] = currentPlayer === player1 ? '⭕' : '❌';

    if (checkWin(board, board[index])) {
      const result = getBoard(board);
      global.GoatBot.onReply.delete(Reply.messageID);
      const winnerName = await getName(usersData, currentPlayer);
      return message.reply(`${result}\n\n${board[index]} ${winnerName} wins!`);
    }

    if (!board.includes('⬜')) {
      const result = getBoard(board);
      global.GoatBot.onReply.delete(Reply.messageID);
      return message.reply(`${result}\n\nIt's a draw!`);
    }

    if (isVsBot && currentPlayer === player1) {
      // Bot makes move
      const available = board.map((v, i) => v === '⬜' ? i : null).filter(v => v !== null);
      const botMove = available[Math.floor(Math.random() * available.length)];
      board[botMove] = '❌';

      if (checkWin(board, '❌')) {
        const result = getBoard(board);
        global.GoatBot.onReply.delete(Reply.messageID);
        return message.reply(`${result}\n\n❌ Bot wins!`);
      }

      if (!board.includes('⬜')) {
        const result = getBoard(board);
        global.GoatBot.onReply.delete(Reply.messageID);
        return message.reply(`${result}\n\nIt's a draw!`);
      }

      const next = getBoard(board);
      return message.reply({
        body: `${next}\n\n⭕ Your turn! Reply with a number (1–9).`
      }, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "ttt",
          messageID: info.messageID,
          board,
          currentPlayer: player1,
          player1,
          player2,
          isVsBot,
          usersData
        });
      });
    }

    // Switch turn in PvP
    const next = getBoard(board);
    const nextPlayer = currentPlayer === player1 ? player2 : player1;
    const nextName = await getName(usersData, nextPlayer);

    message.reply({
      body: `${next}\n\n${board[nextPlayer === player1 ? 0 : 1] === '⭕' ? '⭕' : '❌'} ${nextName}'s turn! Reply with a number (1–9).`
    }, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "ttt",
        messageID: info.messageID,
        board,
        currentPlayer: nextPlayer,
        player1,
        player2,
        isVsBot,
        usersData
      });
    });
  }
};

// Helper functions
function getBoard(b) {
  return `
${b[0]} | ${b[1]} | ${b[2]}
${b[3]} | ${b[4]} | ${b[5]}
${b[6]} | ${b[7]} | ${b[8]}
`.trim();
}

function checkWin(b, symbol) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  return lines.some(([a, b1, c]) => b[a] === symbol && b[b1] === symbol && b[c] === symbol);
}

async function getName(usersData, id) {
  if (id === "BOT") return "Bot";
  const data = await usersData.get(id);
  return data?.name || "Unknown User";
      }
