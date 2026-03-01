# LLM (AI) setup for Grocery Tracker

This app sends photos to **Google Gemini** to extract content (and later meal suggestions). The API key is kept on the server only.

## 1. Get a Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey).
2. Sign in with your Google account.
3. Click **Create API key** → choose or create a project → copy the key.
4. Gemini has a free tier; no payment required to start.

## 2. Set the API key locally

In the project folder, create `.env.local` (already in `.gitignore`):

```bash
echo "GEMINI_API_KEY=your-gemini-key-here" > .env.local
```

Replace `your-gemini-key-here` with your actual key.

## 3. Run the app with the API (Vercel dev)

The `/api/analyze-image` route only runs when the app is run through Vercel.

```bash
vercel dev
```

Open the URL (e.g. `http://localhost:3000`) → **Scan** → **Choose photo (AI)** → pick an image.

## 4. Deploy to Vercel

1. In Vercel project **Settings** → **Environment Variables**, add:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** your Gemini API key
2. **Redeploy** (Deployments → ⋮ on latest → Redeploy) so the new variable is used.

## 5. What the AI does

- **Choose photo (OCR)** – Tesseract in the browser (no key). Extracts text → Staging → Pantry.
- **Choose photo (AI)** – Sends the image to Gemini. Backend returns a short description in JSON. You can change the prompt and response format in `api/analyze-image.js`.

## Troubleshooting

| Issue | What to do |
|-------|------------|
| "GEMINI_API_KEY is not set" | Add it in `.env.local` (local) or Vercel Environment Variables (deploy), then redeploy. |
| "LLM request failed" | Check the full error message; add/recheck the key and redeploy. |
| 404 on /api | Run or deploy with Vercel; plain `npm run dev` does not serve the API. |
