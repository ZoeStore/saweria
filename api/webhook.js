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
      "https://cdn.discordapp.com/attachments/1408544904665108642/1480133549402099825/Zoe.mp4?ex=69ae9149&is=69ad3fc9&hm=53444f67541c08afbfbbe08c275961769fa2528b825a66853166f49399fa676b&"
    ];

    const randomGif =
      gifs[Math.floor(Math.random() * gifs.length)];

    const embed = {

      title: "💎✨ DONATION ALERT ✨💎",

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
