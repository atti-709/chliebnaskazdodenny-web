# Strapi Setup Guide for Chlieb náš každodenný

## Option 1: Strapi Cloud (Recommended for Quick Start)

### Step 1: Create Strapi Cloud Account
1. Go to [cloud.strapi.io](https://cloud.strapi.io)
2. Sign up for a free account
3. Create a new project
4. Wait for your instance to be provisioned (usually 2-3 minutes)
5. You'll get an admin URL like: `https://your-project-name.strapiapp.com`

### Step 2: Access Admin Panel
1. Navigate to `https://your-project-name.strapiapp.com/admin`
2. Create your admin user account

### Step 3: Create Content Type
1. In the admin panel, go to **Content-Type Builder** (left sidebar)
2. Click **"Create new collection type"**
3. Display name: `Devotional`
4. Click **Continue**

### Step 4: Add Fields
Add the following fields one by one:

**Field 1: Date**
- Type: **Date**
- Name: `date`
- Advanced settings:
  - Required field: ✅ Yes
  - Unique field: ✅ Yes

**Field 2: Title**
- Type: **Text** (Short text)
- Name: `title`
- Required field: ✅ Yes

**Field 3: Scripture**
- Type: **Text** (Short text)
- Name: `scripture`
- Required field: ✅ Yes

**Field 4: Text**
- Type: **Rich Text**
- Name: `text`
- Required field: ✅ Yes

**Field 5: Spotify Embed URI**
- Type: **Text** (Short text)
- Name: `spotifyEmbedUri`
- Required field: ✅ Yes

Click **Save** and wait for Strapi to restart.

### Step 5: Set Permissions
1. Go to **Settings** → **Users & Permissions plugin** → **Roles**
2. Click on **Public**
3. Expand **Devotional**
4. Check the following permissions:
   - ✅ `find` (allows finding all devotionals)
   - ✅ `findOne` (allows finding a single devotional)
5. Click **Save**

### Step 6: Add Test Content
1. Go to **Content Manager** → **Devotional**
2. Click **"Create new entry"**
3. Fill in the form:
   - **Date**: Select a date (e.g., 2025-10-04)
   - **Title**: e.g., "Ježiš volá hriešnikov"
   - **Scripture**: e.g., "Marek 2:17"
   - **Devotional Text**: Add your devotional content (supports rich text)
   - **Spotify Embed URI**: e.g., `https://open.spotify.com/embed/episode/2wKLJXkYV0VgQz4hDfZYD9`
4. Click **Save**
5. Click **Publish**
6. Repeat for 5-10 devotionals

### Step 7: Get API URL
Your API URL will be: `https://your-project-name.strapiapp.com/api`

---

## Option 2: Local Strapi Development

### Step 1: Create Local Strapi Project
In a **separate directory** (not in your web app), run:

```bash
npx create-strapi-app@latest chliebnaskazdodenny-cms --quickstart
```

This will:
- Create a new Strapi project
- Install dependencies
- Start Strapi automatically
- Open the admin panel at `http://localhost:1337/admin`

### Step 2: Create Admin Account
When Strapi opens in your browser, create your first admin user.

### Step 3: Follow Steps 3-6 from Option 1
Use the same instructions to:
- Create the Devotional content type
- Add fields
- Set permissions
- Add test content

### Step 4: Local API URL
Your local API URL will be: `http://localhost:1337/api`

---

## Testing Your Strapi API

Once you have content in Strapi, test the API:

### Get All Devotionals
```bash
curl https://your-project-name.strapiapp.com/api/devotionals
```

### Get Devotionals with Filters (by date)
```bash
curl "https://your-project-name.strapiapp.com/api/devotionals?filters[date][$eq]=2025-10-04"
```

You should see JSON data returned!

---

## Next Steps

After completing the Strapi setup:
1. Copy your API URL
2. Update the `.env` file in your web app (see main README)
3. The app will automatically fetch data from Strapi instead of using mock data

---

## Important Notes

### Date Format in Strapi
- Strapi stores dates in ISO format: `2025-10-04T00:00:00.000Z`
- The integration code handles this automatically

### Spotify Embed URLs
Get the correct Spotify embed URL:
1. Open your podcast episode in Spotify
2. Click the **"..."** menu
3. Select **Share** → **Embed episode**
4. Copy the URL (should look like: `https://open.spotify.com/embed/episode/...`)

### Rich Text in Strapi
- Strapi's rich text editor outputs Markdown by default
- You may need to convert it to HTML in the app, or use a different editor plugin
- Alternative: Use the **CKEditor** plugin for HTML output

---

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
1. In Strapi, go to **Settings** → **Security** → **CORS**
2. Enable CORS for your web app's domain
3. For local development, allow `http://localhost:5173`

### 403 Forbidden Errors
- Make sure you've enabled **Public** permissions for `find` and `findOne` on the Devotional content type
- Check that your content is **Published** (not just saved as draft)

### Empty Response
- Verify content exists in **Content Manager** → **Devotional**
- Make sure content is published
- Test the API URL directly in your browser

---

## Resources

- [Strapi Documentation](https://docs.strapi.io)
- [Strapi REST API Reference](https://docs.strapi.io/dev-docs/api/rest)
- [Strapi Cloud](https://cloud.strapi.io)

