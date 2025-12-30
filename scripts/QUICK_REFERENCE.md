# Scripts Quick Reference

## 📤 Upload Episodes to RSS.com

```bash
# Upload all ready episodes
node scripts/upload-to-rss.mjs

# Preview what would be uploaded
node scripts/upload-to-rss.mjs --dry-run

# Upload specific date range
node scripts/upload-to-rss.mjs --start-date 2024-01-01 --end-date 2024-01-31

# Force upload (create duplicates)
node scripts/upload-to-rss.mjs --force
```

**What it does**: Uploads episodes from local FINAL folders to RSS.com and automatically saves player URL to Notion

---

## 🔄 Sync RSS.com Player URLs to Notion

```bash
# Preview what would be synced
node scripts/sync-rss-player-urls.mjs --dry-run

# Sync all episodes
node scripts/sync-rss-player-urls.mjs

# Sync specific date range
node scripts/sync-rss-player-urls.mjs --start-date 2024-01-01 --end-date 2024-01-31

# Sync only recent episodes
node scripts/sync-rss-player-urls.mjs --limit 50
```

**What it does**: Fetches episodes from RSS.com and updates Notion "Spotify Embed URI" field with player URLs

---

## 🔍 Inspect RSS.com Episode

```bash
# Inspect most recent episode
node scripts/inspect-rss-episode.mjs

# Inspect 5th most recent episode
node scripts/inspect-rss-episode.mjs 5
```

**What it does**: Shows full RSS.com API response including all available URL fields for debugging

---

## 📚 Documentation

- **RSS Player Guide**: [RSS_PLAYER_SYNC_GUIDE.md](RSS_PLAYER_SYNC_GUIDE.md)
- **RSS Player Summary**: [RSS_PLAYER_SUMMARY.md](RSS_PLAYER_SUMMARY.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Library Docs**: [lib/README.md](lib/README.md)
- **Developer Guide**: [lib/DEVELOPER_GUIDE.md](lib/DEVELOPER_GUIDE.md)
- **Upload Guide**: [RSS_UPLOAD_GUIDE.md](RSS_UPLOAD_GUIDE.md)

---

## 🚀 Common Workflows

### First Time Setup

1. **Check environment variables** in `.env.local`:
   ```
   RSS_API_KEY=your_key
   RSS_PODCAST_ID=your_id
   NOTION_API_KEY=your_key
   NOTION_DATABASE_ID=your_id
   ```

2. **Inspect one episode** to see URL format:
   ```bash
   node scripts/inspect-rss-episode.mjs
   ```

3. **Sync existing episodes** (one-time):
   ```bash
   node scripts/sync-rss-player-urls.mjs --dry-run
   node scripts/sync-rss-player-urls.mjs
   ```

### Regular Upload Workflow

1. **Prepare episodes** in FINAL folders

2. **Preview upload**:
   ```bash
   node scripts/upload-to-rss.mjs --dry-run
   ```

3. **Upload**:
   ```bash
   node scripts/upload-to-rss.mjs
   ```

4. **Verify** in Notion that "Spotify Embed URI" field is populated

### Troubleshooting Workflow

1. **Inspect RSS.com response**:
   ```bash
   node scripts/inspect-rss-episode.mjs
   ```

2. **Check what would be synced**:
   ```bash
   node scripts/sync-rss-player-urls.mjs --dry-run --limit 1
   ```

3. **Test with one episode**:
   ```bash
   node scripts/sync-rss-player-urls.mjs --start-date 2024-01-15 --end-date 2024-01-15
   ```

---

## 💡 Tips

- **Always use --dry-run first** to preview changes
- **Use --limit** to test with fewer episodes
- **Use date filters** for targeted updates
- **Check logs** for extracted URLs
- **Verify in Notion** after syncing

---

## ⚠️ Important Notes

- **New uploads**: Player URL is saved automatically ✅
- **Existing episodes**: Need one-time sync
- **Rate limiting**: 1-2 second delay between operations
- **Notion field**: Must be named "Spotify Embed URI" and be URL type
- **Permissions**: Notion API key needs write access

---

## 🆘 Need Help?

1. Check the [RSS_PLAYER_SYNC_GUIDE.md](RSS_PLAYER_SYNC_GUIDE.md)
2. Run the inspector: `node scripts/inspect-rss-episode.mjs`
3. Try dry-run mode: `--dry-run`
4. Check environment variables in `.env.local`
5. Verify Notion field name and type

