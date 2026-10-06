# Deployment Guide

This guide will help you deploy the **Chlieb náš každodenný** application to production.

## Prerequisites

Before deploying, ensure you have:

1. ✅ A Notion integration set up (see [NOTION_SETUP.md](./NOTION_SETUP.md))
2. ✅ Your Notion API key (`NOTION_API_KEY`)
3. ✅ Your Notion database IDs, one per year (`NOTION_DATABASE_IDS`, e.g. `2026:<id>,2027:<id>`)
4. ✅ A Git repository (GitHub, GitLab, or Bitbucket)
5. ✅ Code pushed to your repository

## Choose Your Platform

This application is configured for both **Netlify** and **Vercel**. Choose the platform that best suits your needs:

| Feature               | Netlify    | Vercel     |
| --------------------- | ---------- | ---------- |
| Free Tier             | ✅ Generous | ✅ Generous |
| Serverless Functions  | ✅ Yes      | ✅ Yes      |
| Automatic Deployments | ✅ Yes      | ✅ Yes      |
| Custom Domains        | ✅ Yes      | ✅ Yes      |
| Build Minutes         | 300/month  | Unlimited  |

---

## Option 1: Deploy to Netlify

### Step 1: Create Netlify Account

1. Go to [https://www.netlify.com](https://www.netlify.com)
2. Sign up with your GitHub/GitLab/Bitbucket account

### Step 2: Create New Site

1. Click **"Add new site"** → **"Import an existing project"**
2. Choose your Git provider (GitHub, GitLab, or Bitbucket)
3. Select your repository: `chliebnaskazdodenny-web`
4. Configure build settings:
   - **Build command**: `npm run build` (auto-detected from `netlify.toml`)
   - **Publish directory**: `dist` (auto-detected from `netlify.toml`)
   - **Functions directory**: `api` (auto-detected from `netlify.toml`)

### Step 3: Add Environment Variables

1. In your Netlify site dashboard, go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** and add:

   ```
   Key: NOTION_API_KEY
   Value: [Your Notion API Key]
   Scopes: ✅ Production, ✅ Deploy previews, ✅ Branch deploys
   ```

3. Click **"Add a variable"** again and add:

   ```
   Key: NOTION_DATABASE_IDS
   Value: 2026:[2026 Database ID],2027:[2027 Database ID]
   Scopes: ✅ Production, ✅ Deploy previews, ✅ Branch deploys
   ```

   If an older `NOTION_DATABASE_ID` variable exists, it is ignored once
   `NOTION_DATABASE_IDS` is set and can be deleted.

### Step 4: Deploy

1. Click **"Deploy site"**
2. Wait for the build to complete (usually 1-2 minutes)
3. Your site will be live at `https://[random-name].netlify.app`

### Step 5: Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add a domain"**
3. Follow instructions to configure DNS

---

## Option 2: Deploy to Vercel

### Step 1: Create Vercel Account

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with your GitHub/GitLab/Bitbucket account

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Import your Git repository: `chliebnaskazdodenny-web`
3. Configure project:
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Step 3: Add Environment Variables

1. Under **Environment Variables**, add:

   ```
   Name: NOTION_API_KEY
   Value: [Your Notion API Key]
   Environment: ✅ Production, ✅ Preview, ✅ Development
   ```

2. Add another:

   ```
   Name: NOTION_DATABASE_IDS
   Value: 2026:[2026 Database ID],2027:[2027 Database ID]
   Environment: ✅ Production, ✅ Preview, ✅ Development
   ```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-2 minutes)
3. Your site will be live at `https://[project-name].vercel.app`

### Step 5: Custom Domain (Optional)

1. Go to your project's **Settings** → **Domains**
2. Add your custom domain
3. Follow instructions to configure DNS

---

## Post-Deployment Checklist

After deployment, verify:

- [ ] Site loads correctly
- [ ] Devotionals are fetched from Notion
- [ ] Date navigation works
- [ ] Spotify player embeds work (if applicable)
- [ ] Date picker functions properly
- [ ] Mobile responsive design works
- [ ] No console errors

---

## Continuous Deployment

Both platforms support **automatic deployments**:

- Every push to your `main` branch triggers a new deployment
- Pull requests get preview deployments (unique URLs for testing)
- Environment variables are automatically injected during build

---

## Troubleshooting

### Build Fails

**Check:**
- Environment variables are set correctly
- Node.js version is compatible (16+)
- Dependencies are up to date

**Solution:**
```bash
npm install
npm run build
```

### API Calls Fail

**Check:**
- `NOTION_API_KEY` is correct
- `NOTION_DATABASE_IDS` is correct (`YEAR:ID` pairs separated by commas) and contains the year you are viewing
- Notion integration has access to the database

**Solution:**
- Verify environment variables in platform settings
- Re-share database with Notion integration

### Notion Content Not Displaying

**Check:**
- Database ID is correct
- Integration has read permissions
- Database properties match the schema (see [NOTION_SETUP.md](./NOTION_SETUP.md))

**Solution:**
- Go to Notion → Share → Invite your integration
- Verify database schema matches requirements

### Serverless Function Errors

**Check:**
- `api/devotionals.js` is in the repository
- Environment variables are set
- Function logs in platform dashboard

**Solution:**
- Check function logs in Netlify/Vercel dashboard
- Verify `@notionhq/client` is in `dependencies` (not `devDependencies`)

---

## Environment Variables Reference

| Variable              | Description                                                                     | Required | Example                         |
| --------------------- | ------------------------------------------------------------------------------- | -------- | ------------------------------- |
| `NOTION_API_KEY`      | Notion Integration Token                                                        | ✅ Yes   | `secret_ABC123...`              |
| `NOTION_DATABASE_IDS` | Notion database per year, `YEAR:ID` pairs separated by commas                   | ✅ Yes   | `2026:a1b2c3...,2027:d4e5f6...` |
| `NOTION_DATABASE_ID`  | Legacy: single database for all years (ignored if `NOTION_DATABASE_IDS` is set) | No       | `a1b2c3d4e5f6...`               |

### New Year Rollover

Each year has its own Notion database. Before the new year starts: create the new
database with the same schema, share it with the integration, append `,YEAR:<id>` to
`NOTION_DATABASE_IDS` in the Netlify/Vercel environment variables **and** in `.env.local`,
then redeploy so the functions pick up the new value. Audio goes to
`EPIZÓDY/<YEAR>/` on the shared drive. Full checklist:
[NOTION_SETUP.md → Yearly Rollover](./NOTION_SETUP.md#9-yearly-rollover-new-years-database).

---

## Monitoring & Analytics (Optional)

### Add Analytics

Both platforms support analytics:

**Netlify Analytics:**
- Go to **Analytics** tab in dashboard
- Enable analytics ($9/month)

**Vercel Analytics:**
- Go to **Analytics** tab in dashboard
- Enable analytics (free tier available)

### Add Error Tracking

Consider integrating [Sentry](https://sentry.io) for error tracking:

1. Create Sentry account
2. Add Sentry SDK to your project
3. Configure error reporting

---

## Performance Optimization

### Enable Compression

Both Netlify and Vercel automatically:
- ✅ Gzip/Brotli compression
- ✅ HTTP/2
- ✅ Global CDN

### Enable Caching

Notion API responses are cached by the serverless function.

To add more aggressive caching:

1. **Netlify**: Add cache headers in `netlify.toml`
2. **Vercel**: Add cache headers in `vercel.json`

---

## Updating Content

To update devotional content:

1. Edit pages in Notion database
2. Changes appear immediately (no redeployment needed)
3. API calls fetch latest content from Notion

---

## Rollback

If something goes wrong:

**Netlify:**
1. Go to **Deploys** tab
2. Find previous successful deployment
3. Click **"Publish deploy"**

**Vercel:**
1. Go to **Deployments** tab
2. Find previous deployment
3. Click **"..."** → **"Promote to Production"**

---

## Support

For deployment issues:

- **Netlify**: [https://docs.netlify.com](https://docs.netlify.com)
- **Vercel**: [https://vercel.com/docs](https://vercel.com/docs)
- **Notion API**: [https://developers.notion.com](https://developers.notion.com)

---

## Summary

Your application is now deployed! 🎉

- **Static Frontend**: Served via global CDN
- **Serverless API**: Handles Notion API calls securely
- **Automatic Deployments**: Push to Git → Deploy automatically
- **Environment Variables**: Securely stored on platform

Enjoy your beautifully deployed devotional app!

