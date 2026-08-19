async function tgApi(method, body) {
  const token = "8855014573:AAHWMMLzvIgcqgj57LVI72x6bCge3zwZviw";
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

    // /start 入口
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

    // Stars强制要求 /paysupport
    if (update.message?.text === "/paysupport") {
      await tgApi("sendMessage", {
        chat_id: update.message.chat.id,
        text: "💬 支付问题支持\n请联系：@【替换成你的TG账号】\n退款政策：数字虚拟额度售出不退"
      })
      return res.status(200).send("ok");
    }

    // 预结账校验（Stars核心，不能删）
    if (update.pre_checkout_query) {
      await tgApi("answerPreCheckoutQuery", {
        ok: true,
        pre_checkout_query_id: update.pre_checkout_query.id
      })
      return res.status(200).send("ok");
    }

    // 支付成功回调
    if (update.message?.successful_payment) {
      const pay = update.message.successful_payment;
      const chatId = update.message.chat.id;
      const payload = pay.invoice_payload;
      const stars = pay.total_amount;

      let notice = "";
      if (payload === "month") {
        notice = `✅ 月会员购买成功 ⭐${stars} Stars\n已发放100次AI额度`;
      } else if (payload === "year") {
        notice = `✅ 年会员购买成功 ⭐${stars} Stars\n已发放10000次AI额度`;
      } else {
        notice = `✅ 支付成功 ⭐${stars} Stars\nPayload:${payload}`;
      }

      await tgApi("sendMessage", { chat_id: chatId, text: notice });
      return res.status(200).send("ok");
    }

    // 其他消息直接忽略
    return res.status(200).send("ok");
  } catch (err) {
    console.log("err:", err.message);
    return res.status(200).send("ok");
  }
}
