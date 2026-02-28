# LLM (AI) setup for Grocery Tracker

This app can send photos to OpenAI GPT-4o so you can extract content and (later) get meal suggestions. The API key is kept on the server only.

## 1. Get an OpenAI API key

1. Go to [OpenAI API keys](https://platform.openai.com/api-keys).
2. Sign in or create an account.
3. Click **Create new secret key**, name it (e.g. "Grocery Tracker"), and copy the key.
4. You will be charged per use (see [OpenAI pricing](https://openai.com/api/pricing/)); a few dollars is enough to try things out.

## 2. Set the API key locally

In the **grocery-tracker** folder, create a file named `.env.local` (it is already in `.gitignore`):

```bash
cd grocery-tracker
echo "OPENAI_API_KEY=sk-your-actual-key-here" > .env.local
```

Replace `sk-your-actual-key-here` with your real key.

## 3. Run the app with the API (Vercel dev)

The `/api/analyze-image` route only runs when the app is run through Vercel (so the serverless function is available).

**First time:** install Vercel CLI and link (optional for local dev):

```bash
cd grocery-tracker
npm i -g vercel
vercel link
```

**Every time you want to test the AI flow:**

```bash
cd grocery-tracker
vercel dev
```

- Open the URL it prints (e.g. `http://localhost:3000`).
- Tap **Scan** → **Choose photo (AI)** → pick an image.
- You should see "Extracting text…" then the AI response (or an error).

**Without Vercel:** If you run only `npm run dev`, the frontend runs but `/api/analyze-image` is not available, so "Choose photo (AI)" will fail. Use `vercel dev` to test the full flow.

## 4. Deploy to Vercel

1. Push your code to GitHub (if you haven’t already).
2. Go to [vercel.com](https://vercel.com) and sign in.
3. **Add New Project** → import your repo.
4. Set **Root Directory** to `grocery-tracker` (if the app lives in that subfolder).
5. In **Environment Variables**, add:
   - Name: `OPENAI_API_KEY`
   - Value: your OpenAI API key
6. Deploy. Your site will have a URL like `https://your-project.vercel.app`.

The AI flow will work in production only after you set `OPENAI_API_KEY` in the Vercel project settings.

## 5. What the AI does right now

- **Choose photo (OCR)** – Uses Tesseract in the browser (no API key). Extracts text and parses grocery items → Staging → Pantry.
- **Choose photo (AI)** – Sends the image to GPT-4o. The backend returns a short description in JSON. You can change the prompt and response format later in `api/analyze-image.js`.

## Troubleshooting

| Issue | What to do |
|-------|------------|
| "OPENAI_API_KEY is not set" | Add it in `.env.local` (local) or Vercel project Environment Variables (deployed). |
| "Request failed" / network error | Use `vercel dev` so `/api` exists; for deploy, ensure the env var is set and redeploy. |
| CORS or 404 on /api | You must run or deploy with Vercel; plain `npm run dev` does not serve the API. |
