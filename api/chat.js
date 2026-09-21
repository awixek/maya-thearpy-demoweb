export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ reply: "Method not allowed." });
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ reply: "Please enter a question." });

  if (!process.env.OPENAI_API_KEY) {
    return res.status(200).json({
      reply: "Demo mode: I can help you explore the therapy profiles, prepare questions for a therapist, or understand general concepts. Add OPENAI_API_KEY in Vercel for live AI responses."
    });
  }

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an educational AI Support Guide for a therapy practice. Be warm and concise. Do not diagnose, prescribe, claim to be a therapist, or tell a person to make a major medical or relationship decision. Give general educational information, low-risk coping ideas, and questions to discuss with a qualified professional. If there is immediate danger, encourage local emergency services or an appropriate crisis service. Never provide graphic self-harm details. Keep replies under 180 words."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });
    const d = await r.json();
    const replyText = d.choices?.[0]?.message?.content || "I could not generate a response right now.";
    return res.status(200).json({ reply: replyText });
  } catch (e) {
    return res.status(500).json({ reply: "The AI guide is temporarily unavailable. Please contact the practice directly." });
  }
}
