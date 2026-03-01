/**
 * Vercel serverless function: send image to Google Gemini and return raw response.
 * POST body: { imageBase64: string }
 * Requires GEMINI_API_KEY in environment.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not set. Add it in Vercel project settings or .env.local.',
    })
  }

  const { imageBase64 } = req.body || {}
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'Request body must include imageBase64 (string).' })
  }

  const base64Data = imageBase64.startsWith('data:') ? imageBase64.split(',')[1] : imageBase64

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Look at this image. It may be a grocery receipt, a product label, or food on a shelf. Describe what you see in 1–2 sentences. Then return a JSON object with a single key "description" and your description as the value. Return only valid JSON, no markdown.',
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            max_output_tokens: 500,
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API error:', response.status, errText)
      return res.status(response.status).json({
        error: 'LLM request failed',
        details: errText.slice(0, 300),
      })
    }

    const data = await response.json()
    const textPart = data.candidates?.[0]?.content?.parts?.[0]
    const content = textPart?.text ?? ''
    return res.status(200).json({ raw: content })
  } catch (err) {
    console.error('analyze-image error:', err)
    return res.status(500).json({ error: err.message || 'Server error' })
  }
}
