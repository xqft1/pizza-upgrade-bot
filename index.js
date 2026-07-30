import "dotenv/config";
import { ethers } from "ethers";
import TelegramBot from "node-telegram-bot-api";

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const RPC_URL = process.env.RPC_URL;

const NFT = "0xa10fc874aa417f898CebcBFf3Fa548A6e14a083E";

const provider = new ethers.WebSocketProvider(RPC_URL);
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

const abi = [
  "event Upgrade(uint256 indexed tokenId,address indexed owner,uint8 newLevel,uint256 cost)"
];

const contract = new ethers.Contract(NFT, abi, provider);

const LEVELS = [
  "CHEESE.EXE",
  "PEPPERONI.EXE",
  "HAWAIIAN.EXE",
  "MEAT FEAST.EXE",
  "VEGGIE.EXE",
  "BBQ CHICKEN.EXE",
  "SUPREME.EXE",
  "SATOSHI SPECIAL.EXE",
  "GOLDEN.EXE"
];

function short(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function commas(n) {
  return Number(n).toLocaleString("en-US");
}

console.log("🍕 Pizza Upgrade Bot running...");
console.log("Watching:", NFT);

contract.on(
  "Upgrade",
  async (tokenId, owner, newLevel, cost, event) => {
    try {
      tokenId = Number(tokenId);
      const level = Number(newLevel);

      const previous = LEVELS[level - 1];
      const current = LEVELS[level];

      const sato = ethers.formatUnits(cost, 18);

      const image = `https://metadata.satopizza.xyz/image/${tokenId}`;

      const caption = `🔥🍕 PIZZA SLICE UPGRADED 🍕🔥

🆔 Slice #${tokenId}

${previous}
⬇️
${current}

🔥 ${commas(sato)} SATO spent

👤 ${short(owner)}

🖼 OpenSea
https://opensea.io/assets/ethereum/${NFT}/${tokenId}

🔎 Transaction
https://etherscan.io/tx/${event.log.transactionHash}`;

      await bot.sendPhoto(
        CHAT_ID,
        image,
        {
          caption,
          parse_mode: "HTML"
        }
      );

      console.log(`✅ Slice #${tokenId} upgraded`);

    } catch (err) {
      console.error("Upgrade error:", err);
    }
  }
);