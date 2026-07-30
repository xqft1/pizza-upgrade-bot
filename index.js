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

function short(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function commas(n) {
  return Number(n).toLocaleString("en-US");
}

async function getMetadata(tokenId) {
  const res = await fetch(`https://metadata.satopizza.xyz/metadata/${tokenId}`);

  if (!res.ok) {
    throw new Error(`Metadata request failed (${res.status})`);
  }

  return res.json();
}

console.log("🍕 Pizza Upgrade Bot running...");
console.log("Watching:", NFT);

contract.on(
  "Upgrade",
  async (tokenId, owner, newLevel, cost, event) => {
    try {
      tokenId = Number(tokenId);

      const metadata = await getMetadata(tokenId);

      const slice =
        metadata.attributes.find(a => a.trait_type === "Slice")?.value ??
        `LEVEL ${newLevel}`;

      const level =
        metadata.attributes.find(a => a.trait_type === "Level")?.value ??
        newLevel;

      const sato = ethers.formatUnits(cost, 18);

      const image = metadata.image;

      const caption = `🔥🍕 PIZZA SLICE UPGRADED 🍕🔥

🆔 Slice #${tokenId}

🍕 ${slice}
⭐ Level ${level}

🔥 ${commas(sato)} SATO spent

👤 ${short(owner)}

🖼 OpenSea
https://opensea.io/assets/ethereum/${NFT}/${tokenId}

🔎 Transaction
https://etherscan.io/tx/${event.log.transactionHash}`;

      await bot.sendPhoto(CHAT_ID, image, {
        caption
      });

      console.log(`✅ Slice #${tokenId} upgraded`);

    } catch (err) {
      console.error("Upgrade error:", err);
    }
  }
);
