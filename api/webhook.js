import fs from 'fs';
import path from 'path';

function loadEnv() {
  try {
    const raw = fs.readFileSync(path.resolve('.env'), 'utf8');
    raw.split('\n').forEach(line => {
      const r = line.match(/^([A-Z0-9_]+)=(.+)$/);
      if (r) process.env[r[1]] = r[2].trim();
    })
  } catch (e) {
    console.log('读.env失败', e.message);
  }
}
loadEnv();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("ok");
  try {
    const update = req.body;
    const msg = update.message;
    if (!msg || msg.text !== "/start") return res.status(200).send("ok");

    const token = process.env.BOT_TOKEN;
    if (!token) return res.status(200).send("ok");

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: msg.chat.id,
        text: "欢迎来到AI会员商店👇",
        reply_markup: {
          inline_keyboard: [[
            {
              text: "打开商店",
              web_app: { url: "https://plankaisc-ten.vercel.app" }
            }
          ]]
        }
      })
    })
  } catch (err) {
    console.log(err.message);
  }
  res.status(200).send("ok");
}
