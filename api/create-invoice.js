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
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
  const token = process.env.BOT_TOKEN;
  const { type } = JSON.parse(req.body);

  let invoice;
  if (type === "month") {
    invoice = {
      title: "月会员 | 100次AI额度",
      description: "月会员套餐，共100次AI调用额度",
      payload: "month",
      provider_token: "", // Stars留空！
      currency: "XTR",
      prices: [{ label: "月会员", amount: 250 }]
    }
  } else {
    invoice = {
      title: "年会员 | 10000次AI额度",
      description: "年会员套餐，共10000次AI调用额度",
      payload: "year",
      provider_token: "", // Stars留空！
      currency: "XTR",
      prices: [{ label: "年会员", amount: 1800 }]
    }
  }

  const resp = await fetch(`https://api.telegram.org/bot${token}/createInvoiceLink`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invoice)
  })
  const json = await resp.json();
  res.json({ link: json.result });
}
