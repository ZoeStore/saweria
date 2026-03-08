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
  return JSON.parse(fs.readFileSync(dbFile));
}

function saveDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

export default async function handler(req, res) {

  if (req.method === "GET") {
    return res.status(200).json({ message: "Zoe AI Donation System Ready 🚀" });
  }

  if (req.method === "POST") {

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

      database.push({
        email: email,
        name: donorName,
        total: amount,
        messages: message,
        donation_count: 1,
        last_donation: new Date().toISOString()
      });

    }

    saveDB(database);

    const totalDonation = database.reduce((sum, d) => sum + d.total, 0);
    const topDonor = [...database]
      .sort((a, b) => b.total - a.total)[0];
    const gifs = [
      "https://cdn.discordapp.com/attachments/1408544904665108642/1480132989957570674/Rainbow_Line_GIF_by_Javi_Fernandez.gif?ex=69ae90c4&is=69ad3f44&hm=16bbdceeb1d183f929a6bbda574eeeb0f4af0445d32d3a7ef781ec0a99a5e00d&",
      "https://cdn.discordapp.com/attachments/1408544904665108642/1480132989957570674/Rainbow_Line_GIF_by_Javi_Fernandez.gif?ex=69ae90c4&is=69ad3f44&hm=16bbdceeb1d183f929a6bbda574eeeb0f4af0445d32d3a7ef781ec0a99a5e00d&"
    ];

    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    const embed = {

      title: "💎✨ DONATION ALERT ✨💎",

      description:
        "🎉 **Terima kasih atas donasinya!**\n" +
        "🔥 Dukungan kamu sangat berarti untuk stream ini!",

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
        },

        {
          name: "📊 Total Donasi Server",
          value: `💎 Rp ${formatCurrency(totalDonation)}`
        },

        {
          name: "🏆 Top Donator",
          value: `🥇 **${topDonor.name}** — Rp ${formatCurrency(topDonor.total)}`
        },

        {
          name: "📈 Jumlah Donasi User",
          value: `${user ? user.donation_count : 1} kali`
        }

      ],

      footer: {
        text: "🤖 Zoe AI Donation System • Powered by Vercel"
      },

      timestamp: new Date().toISOString()

    };

    // ======================
    // SEND TO DISCORD
    // ======================

    await fetch(process.env.DISCORD_WEBHOOK, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        username: "🤖 Zoe AI Donation Bot",

        avatar_url:
          "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",

        embeds: [embed]

      })

    });

    return res.status(200).json({ success: true });

  }

  return res.status(405).json({ error: "Method Not Allowed" });
}