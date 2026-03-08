import fs from "fs";
import path from "path";

const dbFolder = path.join(process.cwd(), "database");
const dbFile = path.join(dbFolder, "donations.json");

function initDB() {
  if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder);
  }

  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify([]));
  }
}

function loadDB() {
  initDB();
  return JSON.parse(fs.readFileSync(dbFile, "utf8"));
}

function saveDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

export default async function handler(req, res) {

  if (req.method === "GET") {
    return res.status(200).json({
      status: "Zoe AI Donation System Ready 🚀"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const payload = req.body?.data || req.body;

    const donorName =
      payload?.donator ||
      payload?.donator_name ||
      payload?.name ||
      "Anonymous";

    const email =
      payload?.email ||
      payload?.donator_email ||
      "unknown@email.com";

    const amount = Number(
      payload?.amount_raw ||
      payload?.amount ||
      0
    );

    const message =
      payload?.message ||
      "Tidak ada pesan";

    const media =
      payload?.media ||
      payload?.video ||
      payload?.voice ||
      null;

    const formatCurrency = (num) =>
      new Intl.NumberFormat("id-ID").format(num);

    let database = loadDB();

    let user = database.find(d => d.email === email);

    if (user) {

      user.total += amount;
      user.donation_count += 1;

      user.messages = user.messages
        ? user.messages + ", " + message
        : message;

      user.last_donation = new Date().toISOString();

      user.name = donorName;

    } else {

      user = {
        email,
        name: donorName,
        total: amount,
        messages: message,
        donation_count: 1,
        last_donation: new Date().toISOString()
      };

      database.push(user);
    }

    saveDB(database);

    const totalDonation =
      database.reduce((sum, d) => sum + d.total, 0);

    const topDonor =
      [...database].sort((a, b) => b.total - a.total)[0];

    const leaderboard =
      [...database]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((d, i) =>
        `**${i+1}. ${d.name}** — Rp ${formatCurrency(d.total)}`
      )
      .join("\n");

    const gifs = [
      "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif",
      "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
      "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif"
    ];

    const randomGif =
      gifs[Math.floor(Math.random() * gifs.length)];

    const embed = {

      title: "💎✨ DONATION ALERT ✨💎",

      description:
        "🎉 **Terima kasih atas donasi!**\n" +
        "🔥 Dukungan kamu sangat berarti!",

      color: 0x00ffe5,

      thumbnail: {
        url: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
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
          name: "💰 Amount",
          value: `💸 **Rp ${formatCurrency(amount)}**`,
          inline: true
        },

        {
          name: "💬 Message",
          value: `🗨️ ${message}`
        },

        {
          name: "📊 Total Server Donation",
          value: `💎 Rp ${formatCurrency(totalDonation)}`
        },

        {
          name: "🏆 Top Donator",
          value: `🥇 ${topDonor.name} — Rp ${formatCurrency(topDonor.total)}`
        },

        {
          name: "📈 User Donation Count",
          value: `${user.donation_count} kali`
        },

        {
          name: "🔥 Top 5 Leaderboard",
          value: leaderboard
        }

      ],

      footer: {
        text: "🤖 Zoe AI Donation System"
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

        username: "🤖 Zoe AI Donation Bot",

        avatar_url:
          "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",

        content,

        embeds: [embed]

      })

    });

    return res.status(200).json({
      success: true
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Internal Server Error"
    });

  }
}
