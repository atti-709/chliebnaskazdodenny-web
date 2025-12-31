# RSS Episode Update Guide

This guide explains how to update existing episodes on RSS.com with new descriptions and/or audio files.

## Overview

The `update-rss-episodes.mjs` script allows you to update existing episodes on RSS.com without deleting them. This is useful when you want to:

- Update episode descriptions
- Replace audio files (e.g., with improved audio quality)
- Update both description and audio

## Prerequisites

1. **Environment Variables** (in `.env.local`):
   ```
   RSS_API_KEY=your_api_key
   RSS_PODCAST_ID=your_podcast_id
   NOTION_API_KEY=your_notion_token
   NOTION_DATABASE_ID=your_database_id
   ```

2. **ffmpeg** (required for WAV to MP3 conversion):
   ```bash
   # macOS
   brew install ffmpeg
   
   # Linux
   sudo apt-get install ffmpeg
   ```

## Usage

### Basic Commands

```bash
# Update all episodes (description + audio)
npm run rss:update

# Dry run (see what would be updated)
npm run rss:update-dry

# Update only descriptions
npm run rss:update-description

# Update only audio files
npm run rss:update-audio
```

### Advanced Options

```bash
# Update episodes within a date range
node scripts/update-rss-episodes.mjs --start-date 2026-01-01 --end-date 2026-01-31

# Dry run for a specific date range
node scripts/update-rss-episodes.mjs --dry-run --start-date 2026-01-01 --end-date 2026-01-31

# Update only descriptions for a date range
node scripts/update-rss-episodes.mjs --description-only --start-date 2026-01-01
```

## Command Options

| Option                    | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| `--dry-run`               | Show what would be updated without actually updating |
| `--start-date YYYY-MM-DD` | Start date for episodes to update                    |
| `--end-date YYYY-MM-DD`   | End date for episodes to update                      |
| `--description-only`      | Update only the description (no audio upload)        |
| `--audio-only`            | Update only the audio file (no description change)   |

## How It Works

1. **Scans Local Episodes**: The script scans your local episode directory (FINAL folders)

2. **Fetches RSS.com Episodes**: Gets all existing episodes from RSS.com

3. **Matches Episodes**: Matches local episodes with RSS.com episodes by date

4. **Updates Episodes**: For each matched episode:
   - Converts WAV to MP3 if needed (using ffmpeg)
   - Uploads new audio file to RSS.com (if not using `--description-only`)
   - Updates episode description (if not using `--audio-only`)
   - Updates keywords

5. **Reports Results**: Shows a summary of successful/failed updates

## What Gets Updated

### Description

The script uses the standardized episode description:

```html
<p>Pomáhame ti zastaviť sa, načúvať a rásť. Každý deň.</p>
<p>📖 Toto zamyslenie nájdeš aj na našom webe <a href="https://www.chliebnaskazdodenny.sk">chliebnaskazdodenny.sk</a></p>
<p></p>
<p>#chliebnaskazdodenny #zamyslenie #kazdyden #Boh #stisenie</p>
```

This description is defined in `scripts/lib/rss-api.js` as `DEFAULT_EPISODE_DESCRIPTION` and is used consistently across all upload and update operations.

### Audio File

The script:
- Uses the same audio file from your local FINAL folder
- Automatically converts WAV to MP3 if needed
- Uploads the new audio file to RSS.com
- Updates the episode to use the new audio file

### Keywords

The script adds/updates the following keywords for all episodes:
- chliebnaskazdodenny
- zamyslenie
- kazdyden
- Boh
- stisenie

## Example Workflows

### Update All Episodes with New Description

```bash
# First, do a dry run to see what will be updated
npm run rss:update-dry

# If everything looks good, update only descriptions
npm run rss:update-description
```

### Update Audio Files for a Specific Month

```bash
# Update only audio files for January 2026
node scripts/update-rss-episodes.mjs --audio-only --start-date 2026-01-01 --end-date 2026-01-31
```

### Update Everything for Recent Episodes

```bash
# Update both description and audio for episodes since December 1st
node scripts/update-rss-episodes.mjs --start-date 2026-12-01
```

## Important Notes

1. **No Episode Deletion**: Unlike `--force` in the upload script, this update script does NOT delete episodes. It updates them in place.

2. **Episode Matching**: Episodes are matched by date. Make sure your local episode folders follow the naming convention: `YYYYMMDD_Title`

3. **Rate Limiting**: The script waits 2 seconds between updates to avoid overwhelming the API

4. **WAV Conversion**: If you have WAV files, they will be automatically converted to MP3. The MP3 files are saved alongside the WAV files for future use.

5. **Unmatched Episodes**: If a local episode is not found on RSS.com, it will be reported in the summary. These episodes may need to be uploaded first using the upload script.

## Troubleshooting

### Episodes Not Found

If episodes aren't being matched:
- Check that your folder names follow the format `YYYYMMDD_Title`
- Verify episodes exist on RSS.com using the web interface
- Check that your date range includes the episodes

### Audio Upload Fails

If audio upload fails:
- Verify your audio files are in the FINAL folder
- Check file size (very large files may time out)
- Ensure you have network connectivity
- Check API credentials in `.env.local`

### WAV Conversion Fails

If WAV to MP3 conversion fails:
- Verify ffmpeg is installed: `ffmpeg -version`
- Check that the WAV file is valid
- Ensure you have write permissions in the FINAL folder

## Comparing with Upload Script

| Feature                   | `upload-to-rss.mjs`     | `update-rss-episodes.mjs` |
| ------------------------- | ----------------------- | ------------------------- |
| Creates new episodes      | ✅ Yes                   | ❌ No                      |
| Updates existing episodes | ❌ No (unless `--force`) | ✅ Yes                     |
| Deletes episodes          | ⚠️ Only with `--force`   | ❌ Never                   |
| Updates Notion embed URI  | ✅ Yes                   | ❌ No (keeps existing)     |
| Skip if exists            | ✅ Yes (default)         | N/A                       |

## See Also

- [RSS_UPLOAD_GUIDE.md](./RSS_UPLOAD_GUIDE.md) - Guide for uploading new episodes
- [RSS_SETUP.md](./RSS_SETUP.md) - Initial RSS.com setup
- [CONTENT_IMPORT_WORKFLOW.md](./CONTENT_IMPORT_WORKFLOW.md) - Full content workflow

