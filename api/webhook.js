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