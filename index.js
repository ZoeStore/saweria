let database = [];

export default async function handler(req, res) {

  if (req.method === "GET") {
    return res.status(200).json({ message: "Webhook Ready ✅" });
  }

  if (req.method === "POST") {

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
      "No message provided.";

    const formatCurrency = (num) =>
      new Intl.NumberFormat("id-ID").format(num);

    database.push({
      donor: donorName,
      amount,
      message,
      date: new Date().toISOString()
    });

    const totalDonation = database.reduce((sum, d) => sum + d.amount, 0);

    await fetch(process.env.DISCORD_WEBHOOK, {
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

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}