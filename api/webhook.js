let database = [];

export default async function handler(req, res) {

  // ===== LEADERBOARD ENDPOINT =====
  if (req.method === "GET") {

    if (req.url.includes("/leaderboard")) {
      const leaderboard = {};

      database.forEach((d) => {
        if (!leaderboard[d.donor]) {
          leaderboard[d.donor] = 0;
        }
        leaderboard[d.donor] += d.amount;
      });

      const sorted = Object.entries(leaderboard)
        .sort((a, b) => b[1] - a[1])
        .map(([donor, total]) => ({ donor, total }));

      return res.status(200).json(sorted);
    }

    if (req.url.includes("/total")) {
      const total = database.reduce((sum, d) => sum + d.amount, 0);
      return res.status(200).json({ total });
    }

    return res.status(200).json({ message: "Webhook Ready ✅" });
  }

  // ===== POST WEBHOOK SAWERIA =====
  if (req.method === "POST") {

    const raw = req.body;
    const payload = raw?.data || raw;

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

    // Simpan ke memory
    database.push({
      donor: donorName,
      amount,
      message,
      date: new Date().toISOString()
    });

    const totalDonation = database.reduce((sum, d) => sum + d.amount, 0);

    // Kirim ke Discord
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