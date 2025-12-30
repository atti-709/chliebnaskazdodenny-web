# Migration from RSS.com.com to RSS.com

This document outlines the migration from RSS.com.com to RSS.com for podcast episode publishing.

## What Changed

### Scripts
- ✅ Created `scripts/upload-to-rss.mjs` (replaces `upload-to-RSS.com.mjs`)
- ✅ Updated to use RSS.com API v1
- ✅ Changed authentication from OAuth 2.0 to API Key
- ✅ Combined upload and publish into single operation

### API Differences

| Feature        | RSS.com.com                               | RSS.com                   |
| -------------- | ----------------------------------------- | ------------------------- |
| Authentication | OAuth 2.0 (Client ID + Secret)            | API Key                   |
| Upload Method  | Multi-step (authorize → upload → publish) | Single multipart upload   |
| Episode Status | `draft` / `publish`                       | `scheduled` / `published` |
| Date Format    | Unix timestamp                            | ISO 8601                  |

### Documentation
- ✅ Renamed `RSS.com.com_UPLOAD_GUIDE.md` → `RSS_UPLOAD_GUIDE.md`
- ✅ Renamed `RSS.com.com_SETUP.md` → `RSS_SETUP.md`
- ✅ Updated all references throughout documentation

### Environment Variables

**Old (RSS.com.com):**
```env
RSS.com.com_CLIENT_ID=...
RSS.com.com_CLIENT_SECRET=...
```

**New (RSS.com):**
```env
RSS_API_KEY=...
RSS_PODCAST_ID=...
```

### NPM Scripts

**Old:**
```bash
npm run rss.com:dry-run
npm run rss.com:upload
npm run rss.com:force
```

**New:**
```bash
npm run rss:dry-run
npm run rss:upload
npm run rss:force
```

## Setup Instructions

### 1. Get RSS.com API Credentials

1. Log in to your RSS.com account
2. Go to **Settings** → **API Access**
3. Generate an API key
4. Find your Podcast ID in your podcast settings

### 2. Update Environment Variables

Add to `.env.local`:
```env
RSS_API_KEY=your_api_key_here
RSS_PODCAST_ID=your_podcast_id_here
```

### 3. Install Dependencies

```bash
npm install
```

The `formdata-node` package is now required for multipart uploads.

### 4. Test the Migration

```bash
# Test with dry run
npm run rss:dry-run

# Upload a single episode
node scripts/upload-to-rss.mjs --start-date 2026-01-01 --end-date 2026-01-01
```

## Key Features Retained

All features from the RSS.com.com uploader are preserved:

✅ **Automatic WAV → MP3 conversion** (320 kbps)  
✅ **Duplicate detection** (prevents re-uploads)  
✅ **Notion integration** (fetches titles, updates embed URIs)  
✅ **Smart scheduling** (future vs. immediate publishing)  
✅ **Progress tracking** (detailed console output)  
✅ **Error handling** (clear error messages)  
✅ **Dry-run mode** (test before uploading)  
✅ **Date filtering** (upload specific date ranges)  
✅ **Force mode** (override duplicate detection)  

## Benefits of RSS.com

1. **Simpler Authentication**: API key instead of OAuth flow
2. **Unified Upload**: Single API call instead of multi-step process
3. **Better API**: More modern REST API design
4. **Network Plan Features**: Advanced analytics and distribution

## Troubleshooting

### Error: "RSS_API_KEY and RSS_PODCAST_ID must be set"

**Solution**: Add credentials to `.env.local` file

### Error: "formdata-node not found"

**Solution**: Run `npm install`

### Episodes not appearing

**Solution**: 
- Check RSS.com dashboard for episode status
- Verify API key has correct permissions
- Check that podcast ID is correct

## Rollback (if needed)

If you need to rollback to RSS.com.com:

1. Restore environment variables:
```env
RSS.com.com_CLIENT_ID=...
RSS.com.com_CLIENT_SECRET=...
```

2. Use old script:
```bash
node scripts/upload-to-RSS.com.mjs
```

The old script is still available if needed.

## Support

- [RSS.com API Documentation](https://api.rss.com/docs)
- [RSS.com Help Center](https://help.rss.com/)
- [RSS_UPLOAD_GUIDE.md](./RSS_UPLOAD_GUIDE.md) - Complete usage guide

