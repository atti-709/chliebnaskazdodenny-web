# RSS.com Player URL Integration - Summary

## What Was Done

Enhanced the upload scripts to automatically embed RSS.com player URLs in the Notion "Spotify Embed URI" field.

## Changes Made

### 1. Enhanced `lib/rss-api.js`

**Updated `createEpisodeWithAsset()` function**:
- Tries multiple URL fields from RSS.com API response (embed_url, player_url, permalink, etc.)
- Constructs fallback URL from episode ID if no URL is provided
- Logs extracted URLs for debugging
- Returns comprehensive episode data including player URL

### 2. Created `sync-rss-player-urls.mjs`

**New script to sync existing episodes**:
- Fetches episodes from RSS.com
- Matches them with Notion episodes by date
- Updates "Spotify Embed URI" field with RSS.com player URL
- Supports dry-run mode and date filtering
- Includes rate limiting and error handling

### 3. Created `inspect-rss-episode.mjs`

**New debugging tool**:
- Fetches and displays full RSS.com API response
- Shows all available URL fields
- Provides recommendations for which URL to use
- Helps troubleshoot URL extraction issues

### 4. Created `RSS_PLAYER_SYNC_GUIDE.md`

**Comprehensive documentation**:
- How to use the new scripts
- Troubleshooting guide
- Workflow examples
- API reference

### 5. Updated `README.md`

**Added scripts documentation**:
- Quick reference for all scripts
- Link to detailed guide

## Files Created/Modified

### Created:
- `scripts/sync-rss-player-urls.mjs` - Sync script for existing episodes
- `scripts/inspect-rss-episode.mjs` - Debugging tool
- `scripts/RSS_PLAYER_SYNC_GUIDE.md` - Comprehensive guide
- `scripts/RSS_PLAYER_SUMMARY.md` - This file

### Modified:
- `scripts/lib/rss-api.js` - Enhanced URL extraction
- `README.md` - Added scripts documentation

## How It Works

### For New Episodes

When you run `upload-to-rss.mjs`:

1. Episode is uploaded to RSS.com
2. RSS.com returns episode data with URLs
3. Script extracts the best available URL (embed_url → player_url → permalink → constructed)
4. **Automatically updates Notion "Spotify Embed URI" field** ✅

### For Existing Episodes

Run the sync script once:

```bash
# Preview changes
node scripts/sync-rss-player-urls.mjs --dry-run

# Apply changes
node scripts/sync-rss-player-urls.mjs
```

The script will:
1. Fetch all episodes from RSS.com
2. Find matching episodes in Notion by date
3. Update "Spotify Embed URI" field with RSS.com player URL

## Quick Start

### Step 1: Inspect RSS.com Response (Optional)

See what URLs RSS.com provides:

```bash
node scripts/inspect-rss-episode.mjs
```

### Step 2: Sync Existing Episodes

Preview what would be updated:

```bash
node scripts/sync-rss-player-urls.mjs --dry-run
```

Apply the updates:

```bash
node scripts/sync-rss-player-urls.mjs
```

### Step 3: Upload New Episodes

From now on, new episodes automatically get the player URL:

```bash
node scripts/upload-to-rss.mjs
```

## URL Extraction Priority

The script tries to extract URLs in this order:

1. **embed_url** - Best for embedding (if available)
2. **embed_player_url** - Alternative embed URL
3. **player_url** - Web player URL
4. **permalink** - Episode permalink
5. **link** or **url** - Generic episode URL
6. **Constructed URL** - Built from episode ID as fallback

Example constructed URL:
```
https://rss.com/podcasts/[PODCAST_ID]/episodes/[EPISODE_ID]/
```

## Benefits

✅ **Automatic** - New uploads automatically save player URL  
✅ **Retroactive** - Can sync existing episodes with one command  
✅ **Safe** - Dry-run mode to preview changes  
✅ **Debuggable** - Inspect tool to see exact API responses  
✅ **Flexible** - Supports date filtering and limits  
✅ **Well-documented** - Comprehensive guide included  

## Testing

### Test the Inspector

```bash
node scripts/inspect-rss-episode.mjs
```

Expected: See episode details and available URLs

### Test Sync (Dry Run)

```bash
node scripts/sync-rss-player-urls.mjs --dry-run --limit 5
```

Expected: See what would be updated without making changes

### Test Upload

```bash
node scripts/upload-to-rss.mjs --dry-run
```

Expected: See player URL extraction in the logs

## Next Steps

1. **Inspect one episode** to verify URL format:
   ```bash
   node scripts/inspect-rss-episode.mjs
   ```

2. **Sync existing episodes** (if needed):
   ```bash
   node scripts/sync-rss-player-urls.mjs --dry-run
   node scripts/sync-rss-player-urls.mjs
   ```

3. **Upload new episodes** as normal:
   ```bash
   node scripts/upload-to-rss.mjs
   ```

4. **Verify in Notion** that the "Spotify Embed URI" field is populated with RSS.com URLs

## Troubleshooting

### No URL in Response

If RSS.com doesn't provide any URL fields:
- The script will construct one from the episode ID
- Format: `https://rss.com/podcasts/[PODCAST_ID]/episodes/[EPISODE_ID]/`

### Notion Not Updating

Check:
1. Notion API key has write permissions
2. "Spotify Embed URI" field exists and is URL type
3. Run with `--dry-run` to see what would be updated

### Wrong URL Format

1. Run inspector to see available URLs:
   ```bash
   node scripts/inspect-rss-episode.mjs
   ```

2. Check which URL field RSS.com provides
3. Verify the URL works in a browser

## Documentation

- **Detailed Guide**: [RSS_PLAYER_SYNC_GUIDE.md](RSS_PLAYER_SYNC_GUIDE.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Library Docs**: [lib/README.md](lib/README.md)
- **Developer Guide**: [lib/DEVELOPER_GUIDE.md](lib/DEVELOPER_GUIDE.md)

## Summary

The RSS.com player URL integration is complete and ready to use! 

- ✅ **New episodes**: Automatically get RSS.com player URL
- ✅ **Existing episodes**: One-time sync script available
- ✅ **Debugging**: Inspector tool for troubleshooting
- ✅ **Documentation**: Comprehensive guides included

🎉 **Ready to use!**

