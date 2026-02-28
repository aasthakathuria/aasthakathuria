/**
 * Vercel serverless function: send image to OpenAI GPT-4o vision and return raw response.
 * POST body: { imageBase64: string }
 * Requires OPENAI_API_KEY in environment.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not set. Add it in Vercel project settings or .env.local.' })
  }

  const { imageBase64 } = req.body || {}
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'Request body must include imageBase64 (string).' })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Look at this image. It may be a grocery receipt, a product label, or food on a shelf. Describe what you see in 1–2 sentences. Then return a JSON object with a single key "description" and your description as the value. Return only valid JSON, no markdown.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenAI API error:', response.status, errText)
      return res.status(response.status).json({
        error: 'LLM request failed',
        details: errText.slice(0, 200),
      })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? ''
    return res.status(200).json({ raw: content })
  } catch (err) {
    console.error('analyze-image error:', err)
    return res.status(500).json({ error: err.message || 'Server error' })
  }
}
