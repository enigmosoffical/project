# SmartPYQ Admin Panel

This project provides an admin panel for managing PYQ (Previous Year Question) papers for educational purposes.

## 🔐 Authentication

The admin panel now uses **Firebase Authentication** instead of Supabase. 

### Setup Firebase

1. Follow the instructions in [README-Firebase.md](README-Firebase.md) to set up Firebase for this project
2. Configure your environment variables in the `.env` file

## 📁 File Structure

```
project/
├── src/
│   ├── components/
│   │   └── AdminPanel.tsx     # Main admin panel component
│   ├── lib/
│   │   └── firebase.ts        # Firebase configuration
│   └── App.tsx                # Main application component
├── .env                       # Environment variables (not in repo)
├── .env.example              # Example environment variables
├── README-Firebase.md        # Firebase setup guide
└── README-Admin.md           # Legacy Supabase setup guide
```

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Firebase:
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration to `.env`

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Visit `http://localhost:5173/admin` to access the admin panel

## 🛠️ Features

- **Firebase Authentication**: Secure login for admin users
- **Responsive Design**: Works on desktop and mobile devices
- **File Upload**: Upload PDF question papers
- **Stream Management**: Organize papers by streams (JEE, NEET, etc.)
- **Paper Management**: View and organize uploaded papers

## ⚠️ Note

The current implementation only includes Firebase Authentication. The data storage functionality (streams and papers) still needs to be implemented with Firebase Firestore and Storage. This will be added in future updates.

For the legacy Supabase implementation, see [README-Admin.md](README-Admin.md).

## 🧠 AI: Google Gemini Only

The project now uses **Google Gemini (gemini-1.5-flash)** exclusively for AI features (chat, suggestions, pattern analysis). OpenRouter support was removed.

Environment variables (add to your local `.env`):

- `VITE_USE_GEMINI=true` — enable Gemini features.
- `VITE_GEMINI_API_KEY=your_google_api_key` — Google Generative API key (only needed if calling Gemini directly from the browser). We target `models/gemini-1.5-flash-latest` via the `generateContent` endpoint.
- Optional overrides:
   - `VITE_GEMINI_API_VERSION=v1beta` (default)
   - `VITE_GEMINI_MODEL=models/gemini-1.5-flash-latest` (default)
- `VITE_GEMINI_PROXY_URL=http://localhost:3000/api/gemini` — Use the local proxy instead of exposing the key client-side.

Security note: keeping API keys in client-side code is risky. For production, create a small server-side proxy endpoint that holds the `GEMINI_API_KEY` and forwards chat requests to Google; then point the frontend to that proxy. This keeps your key secret and allows you to implement rate limits and logging.

### Server proxy (recommended)

This repo includes a minimal example proxy at `server.js` that forwards chat messages to the Google Generative API (generateContent) without exposing the API key to the browser.

Run locally:

```powershell
# Windows PowerShell (set env var for current process)
$env:GEMINI_API_KEY = 'your_google_api_key'
npm run start:server
```

The proxy listens on port 3000 by default and exposes `POST /api/gemini` which accepts a JSON body:

```jsonc
{
   "messages": [
      { "role": "system", "content": "(optional instruction)" },
      { "role": "user", "content": "Explain PYQ prep" },
      { "role": "assistant", "content": "(model reply)" }
   ]
}
```

It transforms this into Gemini's `contents` format internally and returns:

```jsonc
{ "text": "concatenated model reply", "raw": { /* original Gemini response */ } }
```

In the frontend, set the following env var so the app calls the proxy instead of Google directly:

```
VITE_USE_GEMINI=true
VITE_GEMINI_PROXY_URL=http://localhost:3000/api/gemini
```

This configuration is recommended for development and production so your real API key stays on the server. Remove any `VITE_OPENROUTER_API_KEY` references from `.env` as they are no longer used.

### List available Gemini models

You can discover which models your API key can access via either the proxy or a local script.

- Via proxy (once `node server.js` is running):
   - GET `http://localhost:3000/api/gemini/models`
   - Optional query params: `?pageSize=50` `&pageToken=...`

- Via local script (no proxy required):

```powershell
$env:GEMINI_API_KEY = 'your_google_api_key'
# Optional:
# $env:GEMINI_API_VERSION = 'v1beta'
npm run list:models
```

Use this to choose a model that’s actually available to your key (e.g., `models/gemini-1.5-pro-latest` or `models/gemini-pro`). Then set it in your `.env`:

```
VITE_GEMINI_MODEL=models/gemini-1.5-pro-latest
VITE_GEMINI_API_VERSION=v1beta
```

### Optional: Simple proxy auth

The proxy supports an optional simple token-based auth. Set `GEMINI_PROXY_KEY` when starting the proxy and include the same token in the `X-PROXY-KEY` header for client requests.

Start the proxy with a proxy key (PowerShell):

```powershell
$env:GEMINI_API_KEY = 'your_google_api_key'
$env:GEMINI_PROXY_KEY = 'some-secret-token'
npm run start:server
```

Test the proxy using the included script (PowerShell):

```powershell
$env:GEMINI_PROXY_KEY = 'some-secret-token'
npm run test:proxy
```

If you don't want to use proxy auth, omit `GEMINI_PROXY_KEY` when starting the server and when calling the test script.
