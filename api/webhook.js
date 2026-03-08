export default async function handler(req, res) {

  if (req.method === "GET") {
    return res.status(200).json({
      message: "Zoe AI Donation System Ready 🚀"
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
      "Tidak ada pesan";

    const media =
      payload?.media ||
      payload?.video ||
      payload?.voice ||
      null;

    const formatCurrency = (num) =>
      new Intl.NumberFormat("id-ID").format(num);

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
        "🎉 **Terima kasih atas donasinya!**\n" +
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
        text: "🤖 Zoe AI Donation Bot"
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

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Server Error"
    });

  }

}
