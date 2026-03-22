function buildPrompt(payload) {
  return `You are a fraud detection assistant for online marketplace listings. Analyze the product using the supplied structured data and return JSON only.

Input:\n${JSON.stringify(payload, null, 2)}

Return JSON with this exact schema:\n{
  "classification": "Fraud" | "Likely Legit" | "Suspicious",
  "confidence": number,
  "explanation": string,
  "warnings": string[]
}`;
}

export async function analyzeWithGemini(payload) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: buildPrompt(payload) }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini API returned an empty response.');
  }

  return JSON.parse(text);
}
