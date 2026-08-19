export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"Method Not Allowed"});

  const token = "8855014573:AAHWMMLzvIgcqgj57LVI72x6bCge3zwZviw";

  const { type } = JSON.parse(req.body);

  let invoice;
  if (type === "month") {
    invoice = {
      title: "月会员 | 100次AI额度",
      description: "月会员套餐，共100次AI调用额度",
      payload: "month",
      provider_token: "",
      currency: "XTR",
      prices: [{ label: "月会员", amount: 250 }]
    }
  } else {
    invoice = {
      title: "年会员 | 10000次AI额度",
      description: "年会员套餐，共10000次AI调用额度",
      payload: "year",
      provider_token: "",
      currency: "XTR",
      prices: [{ label: "年会员", amount: 1800 }]
    }
  }

  try{
    const resp = await fetch(`https://api.telegram.org/bot${token}/createInvoiceLink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoice)
    })
    const json = await resp.json();
    if(!resp.ok){
      return res.status(400).json({tg_err:json.description});
    }
    res.json({ link: json.result });
  }catch(err){
    res.status(500).json({error:err.message});
  }
}
