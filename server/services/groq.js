import axios from "axios";

export async function generateContent(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return "(Groq disabled — no API key set.)";

  const payload = {
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "user", content: prompt }
    ]
  };

  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    payload,
    {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    }
  );

  return res.data.choices[0].message.content;
}
