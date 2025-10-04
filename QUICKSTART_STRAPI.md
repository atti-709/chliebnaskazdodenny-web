# 🚀 Quick Start: Connect to Strapi

Follow these steps to get your app connected to Strapi CMS:

## Step 1: Choose Your Strapi Setup

### Option A: Strapi Cloud (Easiest ⭐ Recommended)
1. Go to https://cloud.strapi.io
2. Sign up (free tier available)
3. Create new project → Wait 2-3 minutes
4. You'll get a URL like: `https://your-project-name.strapiapp.com`

### Option B: Local Strapi
```bash
# In a SEPARATE directory:
npx create-strapi-app@latest chliebnaskazdodenny-cms --quickstart
```

---

## Step 2: Set Up Content Type in Strapi

1. Open your Strapi admin panel:
   - Cloud: `https://your-project-name.strapiapp.com/admin`
   - Local: `http://localhost:1337/admin`

2. Go to **Content-Type Builder** → **Create new collection type**
   - Name: `Devotional`

3. Add these 5 fields:
   
   | Field Name      | Type         | Settings             |
   | --------------- | ------------ | -------------------- |
   | date            | Date         | Required ✅, Unique ✅ |
   | title           | Text (short) | Required ✅           |
   | scripture       | Text (short) | Required ✅           |
   | text            | Rich Text    | Required ✅           |
   | spotifyEmbedUri | Text (short) | Required ✅           |

4. Click **Save** (Strapi will restart)

---

## Step 3: Set Permissions

1. **Settings** → **Users & Permissions** → **Roles** → **Public**
2. Expand **Devotional**
3. Check these boxes:
   - ✅ `find`
   - ✅ `findOne`
4. Click **Save**

---

## Step 4: Add Content

1. **Content Manager** → **Devotional** → **Create new entry**
2. Fill in:
   - **Date**: Pick a date (e.g., today)
   - **Title**: "Ježiš volá hriešnikov"
   - **Scripture**: "Marek 2:17"
   - **Text**: Your content (rich text supported)
   - **Spotify Embed URI**: `https://open.spotify.com/embed/episode/...`
3. Click **Save** then **Publish**
4. Add 3-5 more devotionals for testing

### Getting Spotify Embed URLs
1. Open episode in Spotify
2. Click "..." → Share → Embed episode
3. Copy the URL (looks like: `https://open.spotify.com/embed/episode/xxxxx`)

---

## Step 5: Create API Token in Strapi

1. In Strapi admin: **Settings** → **API Tokens** → **Create new API Token**
2. Fill in:
   - **Name**: `Web App Token`
   - **Token type**: `Read-only`
   - **Duration**: `Unlimited`
3. Click **Save** and **copy the token immediately** (you won't see it again!)

## Step 6: Configure Your Web App

1. Create environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local`:
   ```env
   VITE_STRAPI_API_URL=https://your-project-name.strapiapp.com/api
   VITE_STRAPI_API_TOKEN=paste_your_token_here
   ```
   
   Or for local:
   ```env
   VITE_STRAPI_API_URL=http://localhost:1337/api
   VITE_STRAPI_API_TOKEN=paste_your_token_here
   ```

3. Restart dev server:
   ```bash
   npm run dev
   ```

---

## Step 7: Test It! 🎉

1. Open http://localhost:5173
2. Navigate to a date where you added content
3. You should see your devotional from Strapi!

---

## Troubleshooting

### ❌ 403 Forbidden Error
→ Check Public permissions in Strapi (Step 3)

### ❌ No content showing
→ Make sure content is **Published** (not just saved)
→ Check the date matches

### ❌ CORS errors
→ Strapi Settings → Security → CORS
→ Allow `http://localhost:5173`

### ❌ API not responding
→ Make sure Strapi is running (for local setup)
→ Check the API URL in `.env.local`

---

## Testing the API Directly

Try this in your browser or terminal:

```bash
# Replace with your Strapi URL
curl "https://your-project-name.strapiapp.com/api/devotionals"
```

You should see JSON data with your devotionals!

---

## What's Next?

- Add more devotionals in Strapi
- Customize the rich text editor for better formatting
- Set up automatic Spotify RSS feed imports
- Deploy your app (Vercel/Netlify)

For detailed information, see [STRAPI_SETUP_GUIDE.md](./STRAPI_SETUP_GUIDE.md)

