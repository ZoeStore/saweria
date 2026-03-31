<<<<<<< HEAD
import express from "express";
import fs from "fs";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 2022;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const DB_FILE = "./database.json";

// ===== DATABASE FUNCTIONS =====
function readDB() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ===== WEBHOOK SAWERIA =====
app.post("/webhook", async (req, res) => {
  console.log("DATA MASUK:", JSON.stringify(req.body, null, 2));

  const raw = req.body;
  const payload = raw.data || raw;

  const donorName =
    payload.donator ||
    payload.donator_name ||
    payload.name ||
    "Anonymous";

  const amount = Number(
    payload.amount_raw ||
    payload.amount ||
    0
  );

  const message =
    payload.message ||
    "No message provided.";

  const formatCurrency = (num) =>
    new Intl.NumberFormat("id-ID").format(num);

  // ===== SIMPAN DATABASE =====
  const db = readDB();
  db.push({
    donor: donorName,
    amount,
    message,
    date: new Date().toISOString()
  });
  saveDB(db);

  // ===== HITUNG TOTAL DONASI =====
  const totalDonation = db.reduce((sum, d) => sum + d.amount, 0);

  // ===== KIRIM KE DISCORD =====
  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "ZoeBot",
      embeds: [
        {
          title: "🎉 New Donation Received!",
          color: 0x5865F2,
          fields: [
            { name: "👤 Donor", value: donorName, inline: true },
            { name: "💰 Amount", value: `Rp ${formatCurrency(amount)}`, inline: true },
            { name: "💬 Message", value: message },
            { name: "📊 Total Donation", value: `Rp ${formatCurrency(totalDonation)}` }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    })
  });

  res.status(200).json({ success: true });
});

// ===== LEADERBOARD ENDPOINT =====
app.get("/leaderboard", (req, res) => {
  const db = readDB();

  const leaderboard = {};

  db.forEach((d) => {
    if (!leaderboard[d.donor]) {
      leaderboard[d.donor] = 0;
    }
    leaderboard[d.donor] += d.amount;
  });

  const sorted = Object.entries(leaderboard)
    .sort((a, b) => b[1] - a[1])
    .map(([donor, total]) => ({ donor, total }));

  res.json(sorted);
});

// ===== TOTAL DONATION ENDPOINT =====
app.get("/total", (req, res) => {
  const db = readDB();
  const total = db.reduce((sum, d) => sum + d.amount, 0);
  res.json({ total });
});

app.listen(2022, () => {
  console.log(`🚀 Server running on port ${2022}`);
});
=======
export default async function handler(req, res) {

  if (req.method === "GET") {
    return res.status(200).json({
      message: "Zoe Donation System Ready 🚀"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  try {

    const payload = req.body?.data || req.body;

    const donorName =
      payload?.donator ||
      payload?.donator_name ||
      payload?.name ||
      "Anonymous";

    const amount = Number(
      payload?.amount_raw ||
      payload?.amount ||
      0
    );

    const message =
      payload?.message ||
      "No message";

    const media =
      payload?.media ||
      payload?.video ||
      payload?.voice ||
      null;

    const formatCurrency = (num) =>
      new Intl.NumberFormat("id-ID").format(num);

    const gifs = [
      "https://cdn.discordapp.com/attachments/1408544904665108642/1480141780057063579/mioffice_animation_mioffice.gif?ex=69ae98f4&is=69ad4774&hm=9c86e2923c64e7f0ce1e2373ff22beb2c94303772b0945449788a82d4d7fc01a&"
    ];

    const randomGif =
      gifs[Math.floor(Math.random() * gifs.length)];

    const embed = {

      title: "📢 DONATION ALERT",

      description:
        "🎉 **Thank you for your donation!**\n" +
        "🔥 Your support means a lot!",

      color: 0x00ffe5,

      thumbnail: {
        url: "https://cdn.discordapp.com/attachments/1408544904665108642/1478223368326217930/z.png?ex=69ae35cb&is=69ace44b&hm=9af28c354bb8855892f6cc45db4ca79be6ae55845bb2e58fa7525877d66a3c6b&"
      },

      image: {
        url: randomGif
      },

      fields: [

        {
          name: "👤 Donator",
          value: `✨ **${donorName}**`,
          inline: true
        },

        {
          name: "💰 Donation",
          value: `💸 **Rp ${formatCurrency(amount)}**`,
          inline: true
        },

        {
          name: "💬 Message",
          value: `🗨️ ${message}`
        }

      ],

      footer: {
        text: "🤖 Zoe Donation Bot - Saweria.co/Zoeli"
      },

      timestamp: new Date().toISOString()

    };

    const content = media
      ? `🎬 **Media Donation Detected!**\n${media}`
      : null;

    await fetch(process.env.DISCORD_WEBHOOK, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        username: "Zoe Donation Bot",

        avatar_url:
          "https://cdn.discordapp.com/attachments/1408544904665108642/1478223368326217930/z.png?ex=69ae35cb&is=69ace44b&hm=9af28c354bb8855892f6cc45db4ca79be6ae55845bb2e58fa7525877d66a3c6b&",

        content,

        embeds: [embed]

      })

    });

    return res.status(200).json({
      success: true
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Server Error"
    });

  }

}


>>>>>>> 578ca9abc4fe38a87691bf2544433cb86354d332
