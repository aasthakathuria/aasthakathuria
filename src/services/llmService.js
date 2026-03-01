/**
 * Call the backend to analyze an image with the LLM.
 * @param {string} imageBase64 - Base64-encoded image (with or without data URL prefix)
 * @returns {Promise<{ raw: string }>} - Response with raw LLM content
 */
export async function analyzeImageWithLLM(imageBase64) {
  const base64Only = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64
  const res = await fetch('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64Only }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.details
      ? `${data.error || 'Request failed'}: ${data.details}`
      : (data.error || `Request failed: ${res.status}`)
    throw new Error(msg)
  }
  return data
}

/**
 * Convert a File to base64 string (without data URL prefix).
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
      resolve(base64)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
