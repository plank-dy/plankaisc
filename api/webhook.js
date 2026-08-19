export default async function handler(req, res) {
  // 只处理POST（Telegram推送都是POST）
  if (req.method !== 'POST') {
    return res.status(200).send('ok');
  }

  try {
    const update = req.body;
    const msg = update.message;
    if (!msg || msg.text !== '/start') {
      return res.status(200).send('ok');
    }

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const WEBAPP_URL = process.env.WEBAPP_URL;
    if (!BOT_TOKEN || !WEBAPP_URL) {
      throw new Error('环境变量缺失');
    }

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: msg.chat.id,
        text: '欢迎来到AI会员商店👇',
        reply_markup: {
          inline_keyboard: [[
            { text: '打开商店', web_app: { url: WEBAPP_URL } }
          ]]
        }
      })
    });

  } catch (err) {
    console.error('错误：', err.message);
  }

  // ✅ 无论成功失败，必须立刻返回200，防止TG反复重试
  res.status(200).send('ok');
}
