# Podbean Upload Guide

This guide explains how to use the automated Podbean episode uploader script to publish your daily podcast episodes.

## Overview

The `upload-to-podbean.mjs` script automates the process of uploading podcast episodes to Podbean. It:

1. 📂 Scans your local episodes directory for episodes ready to upload (those with a FINAL folder)
2. 📅 Extracts the publication date from the folder name
3. 📝 Fetches the episode title from your Notion database
4. 📤 Uploads the audio file to Podbean
5. 🎙️ Publishes the episode with the correct title and release date

## Prerequisites

### 1. Podbean API Credentials

You need to obtain API credentials from Podbean:

1. Go to [Podbean Developers Portal](https://developers.podbean.com/)
2. Sign in with your Podbean account
3. Create a new app or use an existing one
4. Copy your **Client ID** and **Client Secret**

### 2. Environment Variables

Add the following to your `.env.local` file in the project root:

```env
# Podbean API Credentials
PODBEAN_CLIENT_ID=your_client_id_here
PODBEAN_CLIENT_SECRET=your_client_secret_here

# Notion API Credentials (already configured)
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_notion_database_id
```

## Episode Folder Structure

The script expects your episodes to be organized in the following structure:

```
/Users/atti/Library/CloudStorage/GoogleDrive-xzsiros@gmail.com/Shared drives/Chlieb náš každodenný/EPIZÓDY/
├── 20260101_episode_name/
│   ├── FINAL/
│   │   └── 2026_01_01_Episode_Name.wav
│   └── SRC/
├── 20260102_another_episode/
│   ├── FINAL/
│   │   └── 2026_01_02_Another_Episode.wav
│   └── SRC/
└── ...
```

**Important:**
- Folder name format: `YYYYMMDD_episode_slug`
- Only episodes with a `FINAL` folder will be processed
- Supported audio formats: `.wav`, `.mp3`, `.m4a`

## Usage

### Dry Run (Recommended First)

Test what would be uploaded without actually uploading:

```bash
npm run podbean:dry-run
```

Or with custom date range:

```bash
node scripts/upload-to-podbean.mjs --dry-run --start-date 2026-01-01 --end-date 2026-01-31
```

### Upload All Episodes

Upload all episodes that are ready:

```bash
npm run podbean:upload
```

### Upload with Skip Already Uploaded

Skip episodes that are already on Podbean:

```bash
npm run podbean:upload-skip
```

### Upload Specific Date Range

Upload episodes within a specific date range:

```bash
node scripts/upload-to-podbean.mjs --start-date 2026-01-01 --end-date 2026-01-15
```

## Command Line Options

| Option                    | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `--dry-run`               | Show what would be uploaded without actually uploading |
| `--start-date YYYY-MM-DD` | Start date for episodes to upload                      |
| `--end-date YYYY-MM-DD`   | End date for episodes to upload                        |
| `--skip-uploaded`         | Skip episodes that are already uploaded to Podbean     |

## How It Works

### 1. Episode Scanning

The script scans the episodes directory and looks for folders with the format `YYYYMMDD_episode_name` that contain a `FINAL` subfolder with an audio file.

### 2. Date Extraction

The date is extracted from the folder name:
- Folder: `20260101_strach_z_neznama`
- Date: `2026-01-01`

### 3. Title Fetching

The script queries your Notion database for a page with a matching date and retrieves the episode title from the `Title` property.

### 4. Upload Process

For each episode:
1. **Authorization**: Gets an upload authorization URL from Podbean
2. **Upload**: Uploads the audio file to Podbean's storage
3. **Publish**: Creates the episode on Podbean with:
   - Title from Notion
   - Audio file
   - Publication date at 6:00 AM (from folder name)
   - Status: Published

### 5. Rate Limiting

The script automatically waits 2 seconds between uploads to avoid hitting Podbean's API rate limits.

## Output Example

```
🚀 Podbean Episode Uploader

🔑 Authenticating with Podbean...
✅ Successfully authenticated with Podbean

📂 Scanning episodes directory: /Users/atti/Library/CloudStorage/GoogleDrive-...
✅ Found 10 episodes ready to upload

============================================================
📅 Processing episode for 2026-01-01
📁 Folder: 20260101_strach_z_neznama
📄 File: 2026_01_01_Strach_z_neznama.wav (51.02 MB)
📝 Title: Strach z neznáma
📤 Uploading audio file...
✅ Audio file uploaded successfully
📝 Publishing episode on Podbean...
✅ Episode published successfully
✅ Successfully uploaded episode for 2026-01-01

⏳ Waiting 2 seconds before next upload...

============================================================
📊 Upload Summary:
✅ Success: 10
❌ Failed: 0
📝 Total: 10

✨ Upload complete!
```

## Troubleshooting

### Error: Authentication Failed

**Problem**: Invalid Podbean credentials

**Solution**:
1. Verify your `PODBEAN_CLIENT_ID` and `PODBEAN_CLIENT_SECRET` in `.env.local`
2. Make sure you copied them correctly from Podbean Developers Portal
3. Check that your Podbean app is active

### Error: No episode title found in Notion

**Problem**: Episode doesn't exist in Notion database for the given date

**Solution**:
1. Check that the Notion page exists for that date
2. Verify the date format in the folder name is correct (YYYYMMDD)
3. Make sure the Notion database has a `Date` property with the correct date

### Error: No audio file found in FINAL folder

**Problem**: Episode folder doesn't contain an audio file in the FINAL subfolder

**Solution**:
1. Ensure the episode has a `FINAL` folder
2. Check that the audio file is in a supported format (`.wav`, `.mp3`, `.m4a`)
3. Verify the file is not empty or corrupted

### Error: Upload failed

**Problem**: Network or Podbean API issue

**Solution**:
1. Check your internet connection
2. Verify the audio file is not too large (Podbean has size limits)
3. Try again later if Podbean API is experiencing issues

## Best Practices

1. **Always run dry-run first**: Use `--dry-run` to verify what will be uploaded before actually uploading
2. **Use date ranges for testing**: Start with a small date range to test the script
3. **Skip uploaded episodes**: Use `--skip-uploaded` to avoid duplicate uploads
4. **Monitor the output**: Watch for any errors or warnings during upload
5. **Backup your episodes**: Keep backups of your audio files before uploading

## Scheduling Automatic Uploads

You can schedule the upload script to run automatically using cron (macOS/Linux) or Task Scheduler (Windows).

### macOS Example (using cron)

1. Open terminal and edit crontab:
```bash
crontab -e
```

2. Add a line to run the script daily at 5:00 AM:
```cron
0 5 * * * cd /Users/atti/Source/Repos/chliebnaskazdodenny-web && /usr/local/bin/node scripts/upload-to-podbean.mjs --skip-uploaded >> /tmp/podbean-upload.log 2>&1
```

This will:
- Run at 5:00 AM every day
- Skip already uploaded episodes
- Log output to `/tmp/podbean-upload.log`

## Support

If you encounter any issues:

1. Check this guide's troubleshooting section
2. Review the error messages in the console output
3. Verify your environment variables are set correctly
4. Check the [Podbean API Documentation](https://developers.podbean.com/podbean-api-docs/)

## Related Documentation

- [Notion Setup Guide](./NOTION_SETUP.md) - Setting up Notion integration
- [Upload Guide](./UPLOAD_GUIDE.md) - Uploading devotionals to Notion
- [README](./README.md) - Main project documentation

