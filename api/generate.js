import React from "react";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OPENROUTER_API_KEY is not configured in Vercel." });

  const { topic, audience = "US Audience", contentType = "post", tone = "Practical & Human", goal = "Growth & Engagement" } = req.body || {};
  if (!topic || !String(topic).trim()) return res.status(400).json({ error: "Topic is required." });

  const model = process.env.OPENROUTER_MODEL || "openrouter/free";
  const system = `You create useful social media content for a US Facebook audience. Return ONLY valid JSON with exactly these keys: hook, post, cta, imagePrompt, reelScript, carousel. carousel must be an array of exactly 5 strings. Write natural American English. Do not invent statistics, quotes, product features, prices, news, testimonials, or sources. Avoid fake urgency, misleading clickbait, excessive emojis and hashtag stuffing. Keep the copy practical, readable on a phone, and useful. The imagePrompt should describe a realistic social-media visual and should not ask the image model to render text. reelScript should be a concise vertical-video voiceover. The content type is ${contentType}.`;
  const user = `Topic: ${topic}\nAudience: ${audience}\nGoal: ${goal}\nTone: ${tone}\nCreate the content package now.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://ai-content-studio-v2.vercel.app", "X-Title": "AI Content Studio" },
      body: JSON.stringify({ model, temperature: 0.75, max_tokens: 2200, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || "OpenRouter request failed." });
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return res.status(502).json({ error: "The AI returned an empty response." });
    let parsed;
    try { parsed = JSON.parse(raw); } catch { return res.status(502).json({ error: "The AI returned invalid JSON. Try Generate again." }); }
    if (!parsed.post || !Array.isArray(parsed.carousel)) return res.status(502).json({ error: "The AI response was incomplete. Try again." });
    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server error while generating content." });
  }
}
