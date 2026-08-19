const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: false }
});
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// /start 指令：弹出WebApp Open按钮
bot.command('start', async (ctx) => {
  await ctx.reply('欢迎购买AI会员，请点下方打开商城', {
    reply_markup: {
      inline_keyboard: [[
        { text: '🛒 打开商城', web_app: { url: process.env.WEBAPP_URL } }
      ]]
    }
  });
});

// 处理Stars支付成功回调
bot.on('successful_payment', async (ctx) => {
  const pay = ctx.message.successful_payment;
  const tgId = ctx.from.id;
  // payload标记套餐，例如 premium_month / premium_year
  const pkg = pay.invoice_payload;
  let quota = 0;
  if(pkg === 'premium_month') quota = 100;
  if(pkg === 'premium_year') quota = 10000;

  await supabase
    .from('users')
    .upsert({
      tg_user_id: tgId,
      ai_quota: quota,
      paid: true
    });

  await ctx.reply('✅ Stars支付成功！后续真人校验功能开发中...');
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body);
    res.end('ok');
  } else {
    res.end('hello');
  }
};
