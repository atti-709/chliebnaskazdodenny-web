# Spotify Sync Guide

This guide explains how to set up automatic syncing of Spotify episode embeds to your Notion database using Vercel cron jobs.

## Overview

The Spotify sync feature automatically:
1. 🎵 Fetches your latest episodes from Spotify
2. 🔍 Matches them with Notion devotional pages by date and title
3. 🔄 Updates Notion pages with Spotify embed URIs (replacing Podbean embeds)
4. ⏰ Runs daily at 6:00 AM UTC via Vercel cron job

This allows you to use Podbean embeds immediately after upload, then automatically switch to Spotify embeds once episodes sync to Spotify (typically 24-48 hours later).

## Prerequisites

### 1. Submit Your Podcast to Spotify

Before setting up the sync, your podcast must be available on Spotify:

1. Go to your Podbean dashboard
2. Navigate to **Distribution** → **Submit to Directories**
3. Submit your podcast to Spotify
4. Wait for approval (typically 1-3 days)

### 2. Get Spotify API Credentials

1. Go to [Spotify for Developers Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **Create an App**
4. Fill in the details:
   - **App Name**: Chlieb náš každodenný Sync
   - **App Description**: Automatic episode embed sync
   - **Redirect URI**: Not needed for this use case
5. Accept the terms and click **Create**
6. You'll see your **Client ID** and **Client Secret**
7. Copy both values

### 3. Get Your Spotify Show ID

Your Show ID is a unique identifier for your podcast on Spotify.

**Method 1: From Spotify Web Player**
1. Open your podcast on [Spotify Web Player](https://open.spotify.com/)
2. Look at the URL: `https://open.spotify.com/show/SHOW_ID`
3. Copy the `SHOW_ID` part

**Method 2: From Spotify URI**
1. Open your podcast in the Spotify app
2. Click **...** (more options) → **Share** → **Copy Show Link**
3. The link contains your show ID: `spotify:show:SHOW_ID`

## Setup

### 1. Add Environment Variables

Add the following to your `.env.local` file:

```env
# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_SHOW_ID=your_podcast_show_id_here

# Optional: Secure your cron endpoint
VERCEL_CRON_SECRET=your_random_secret_here
```

### 2. Add to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_SHOW_ID`
   - `VERCEL_CRON_SECRET` (optional)

**Important:** Make sure to add these for the **Production** environment.

### 3. Deploy to Vercel

The cron job is already configured in `vercel.json`. Simply deploy your project:

```bash
git add .
git commit -m "Add Spotify sync cron job"
git push
```

Vercel will automatically:
- Detect the cron job configuration
- Schedule it to run daily at 6:00 AM UTC
- Start syncing episodes

## How It Works

### Automatic Sync Process

1. **Daily Execution**: Runs every day at 6:00 AM UTC
2. **Fetch Episodes**: Gets the 50 most recent episodes from Spotify
3. **Match with Notion**: Matches episodes with Notion pages by:
   - Release date (exact match)
   - Title (fuzzy match if multiple pages on same date)
4. **Update Notion**: Updates pages that have Podbean embeds with Spotify embeds
5. **Skip Already Updated**: Skips pages that already have Spotify embeds

### Matching Logic

Episodes are matched with Notion pages using:
- **Primary**: Release date (YYYY-MM-DD)
- **Secondary**: Normalized title comparison (removes diacritics, special characters)

### What Gets Updated

- ✅ Pages with Podbean embed URIs → Updated to Spotify
- ✅ Pages with empty embed URIs → Updated to Spotify
- ⏭️ Pages with existing Spotify URIs → Skipped (no change)

## Manual Testing

You can manually trigger the sync by calling the API endpoint:

```bash
curl https://your-vercel-domain.vercel.app/api/sync-spotify-embeds
```

Or visit it in your browser:
```
https://your-vercel-domain.vercel.app/api/sync-spotify-embeds
```

**Note:** If you set `VERCEL_CRON_SECRET`, you'll need to include it in the request header:

```bash
curl -H "x-vercel-cron-secret: your_secret" \
  https://your-vercel-domain.vercel.app/api/sync-spotify-embeds
```

## Monitoring

### Check Cron Job Logs

1. Go to your Vercel project dashboard
2. Navigate to **Deployments** → Select latest deployment
3. Click **Functions** → Find `sync-spotify-embeds`
4. View the execution logs

### Response Format

Successful sync response:
```json
{
  "success": true,
  "timestamp": "2026-01-15T06:00:00.000Z",
  "spotify_episodes": 50,
  "notion_pages": 365,
  "updated": 5,
  "skipped": 45,
  "errors": 0,
  "updates": [
    {
      "date": "2026-01-15",
      "title": "Strach z neznáma",
      "spotifyUri": "https://open.spotify.com/embed/episode/abc123",
      "notionPageId": "page-id-123"
    }
  ]
}
```

## Customization

### Change Sync Schedule

Edit `vercel.json` to change the cron schedule:

```json
{
  "crons": [
    {
      "path": "/api/sync-spotify-embeds",
      "schedule": "0 6 * * *"  // 6:00 AM UTC daily
    }
  ]
}
```

Common schedules:
- `0 */6 * * *` - Every 6 hours
- `0 0 * * *` - Midnight UTC daily
- `0 12 * * *` - Noon UTC daily

Learn more: [Cron Expression Guide](https://crontab.guru/)

### Change Number of Episodes Fetched

By default, the sync fetches the 50 most recent episodes. To change this, edit `api/sync-spotify-embeds.js`:

```javascript
const spotifyEpisodes = await getSpotifyEpisodes(spotifyToken, 100) // Fetch 100 episodes
```

## Troubleshooting

### Error: "SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set"

**Solution**: Add the credentials to Vercel environment variables.

### Error: "SPOTIFY_SHOW_ID must be set"

**Solution**: Add your podcast's Spotify Show ID to environment variables.

### Error: "Spotify auth failed"

**Solution**: 
- Verify your Client ID and Client Secret are correct
- Make sure your Spotify app is not in development mode restrictions

### No Episodes Found on Spotify

**Solution**:
- Verify your podcast is approved and live on Spotify
- Check that the Show ID is correct
- Wait 24-48 hours after Podbean upload for episodes to sync

### Episodes Not Matching

**Solution**:
- Check that the release date in Spotify matches the Date field in Notion
- Verify episode titles are similar (minor differences are OK)
- Check the cron job logs for matching details

### Cron Job Not Running

**Solution**:
1. Verify `vercel.json` is in your project root
2. Make sure the project is deployed to Vercel
3. Check that you're on a Pro or Enterprise Vercel plan (crons require paid plans)
4. View the deployment logs to see if there are any errors

## Workflow

Here's the complete workflow from upload to Spotify embed:

1. **Day 0**: Upload episode to Podbean using `upload-to-podbean.mjs`
   - Episode published on Podbean
   - Notion updated with Podbean embed URI
   - Website shows Podbean player immediately ✅

2. **Day 1-2**: Wait for Podbean → Spotify sync
   - Podbean automatically syncs to Spotify
   - Episode appears on Spotify (24-48 hours)

3. **Day 2+**: Automatic sync to Spotify embeds
   - Vercel cron job runs daily at 6 AM
   - Detects new episode on Spotify
   - Updates Notion with Spotify embed URI
   - Website now shows Spotify player ✅

No manual work required! 🎉

## Security

### Securing the Cron Endpoint

Set `VERCEL_CRON_SECRET` to prevent unauthorized access:

```env
VERCEL_CRON_SECRET=your-random-long-secret-here
```

The cron job will verify this secret in the request header.

**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Best Practices

1. **Monitor First Week**: Check logs daily for the first week to ensure proper matching
2. **Verify Matches**: Spot-check a few episodes on your website after sync
3. **Keep Podbean as Fallback**: Don't delete Podbean embeds manually - let the cron job handle it
4. **Test Manually First**: Trigger the sync manually before relying on the cron schedule

## Related Documentation

- [Podbean Upload Guide](./PODBEAN_UPLOAD_GUIDE.md) - Uploading episodes to Podbean
- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Spotify for Developers](https://developer.spotify.com/documentation/)

