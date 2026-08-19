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

async function tgApi(method, body) {
  const token = process.env.BOT_TOKEN;
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("ok");

  try {
    const update = req.body;
    console.log("收到Update：", JSON.stringify(update));

    // ✅ /start 欢迎消息 + 打开商店按钮
    if (update.message?.text === "/start") {
      await tgApi("sendMessage", {
        chat_id: update.message.chat.id,
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
      return res.status(200).send("ok");
    }

    // ✅ Stars强制要求：/paysupport 支付支持指令
    if (update.message?.text === "/paysupport") {
      await tgApi("sendMessage", {
        chat_id: update.message.chat.id,
        text: "💬 支付问题支持\n请联系：@【替换成你的TG账号】\n退款政策：数字虚拟额度售出不退"
      })
      return res.status(200).send("ok");
    }

    // ✅【必写】预结账校验 pre_checkout_query，10s内必须回复 ok:true
    if (update.pre_checkout_query) {
      await tgApi("answerPreCheckoutQuery", {
        ok: true,
        pre_checkout_query_id: update.pre_checkout_query.id
      })
      return res.status(200).send("ok");
    }

    // ✅ 支付成功回调 successful_payment
    if (update.message?.successful_payment) {
      const pay = update.message.successful_payment;
      const chatId = update.message.chat.id;
      const payload = pay.invoice_payload;
      const stars = pay.total_amount;

      let notice = "";
      if (payload === "month") {
        notice = `✅ 月会员购买成功 ⭐${stars} Stars\n已发放100次AI额度`;
        // =========在这里写你的数据库逻辑：给用户+100额度=========
      } else if (payload === "year") {
        notice = `✅ 年会员购买成功 ⭐${stars} Stars\n已发放10000次AI额度`;
        // =========在这里写你的数据库逻辑：给用户+10000额度=========
      } else {
        notice = `✅ 支付成功 ⭐${stars} Stars\nPayload:${payload}`;
      }

      await tgApi("sendMessage", { chat_id: chatId, text: notice });
      return res.status(200).send("ok");
    }

    // 其他update直接忽略
    return res.status(200).send("ok");
  } catch (err) {
    console.log("全局异常：", err.message);
    return res.status(200).send("ok");
  }
}
