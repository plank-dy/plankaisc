export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("ok");
  }
  try {
    const update = req.body;
    const msg = update.message;
    if (!msg || msg.text !== "/start") {
      return res.status(200).send("ok");
    }

    const token = process.env.BOT_TOKEN;
    if (!token) throw new Error("BOT_TOKEN缺失");

    // 先只发纯文本，排除WebApp域名配置问题
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        chat_id: msg.chat.id,
        text: "✅ /start 收到啦！测试成功"
      })
    });
  } catch (e) {
    console.log("ERR:", e.message);
  }
  res.status(200).send("ok");
}
