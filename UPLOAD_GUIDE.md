# Notion Upload Guide

This guide explains how to use the `upload-to-notion.mjs` script to import devotionals from JSON to Notion.

## Prerequisites

1. ✅ Notion integration set up (see `NOTION_SETUP.md`)
2. ✅ Environment variables configured in `.env.local`:
   - `VITE_NOTION_API_KEY`
   - `VITE_NOTION_DATABASE_ID`
3. ✅ JSON file with parsed devotionals (e.g., `devotionals-2026-jan.json`)

## Basic Usage

### Using npm scripts (recommended)

```bash
npm run upload:dry-run   # Test without creating pages
npm run upload:test      # Upload first 3 pages
npm run upload           # Upload all devotionals
npm run upload:force     # Upload all, replacing existing pages
```

### Direct usage

```bash
node upload-to-notion.mjs [json-file] [options]
```

If no file is specified, it defaults to `devotionals-2026-jan.json`.

## Examples

### 1. Dry Run (Test without creating pages)

Test the script to see what would be uploaded without actually creating pages:

```bash
node upload-to-notion.mjs devotionals-2026-jan.json --dry-run
```

This will:
- ✅ Read and parse the JSON
- ✅ Show a sample devotional
- ❌ NOT create any Notion pages

**Always run this first to verify your JSON is valid!**

### 2. Upload All Devotionals

```bash
node upload-to-notion.mjs devotionals-2026-jan.json
```

This uploads all devotionals in the file.

### 3. Upload Specific Range

Upload only devotionals 0-9 (first 10):

```bash
node upload-to-notion.mjs devotionals-2026-jan.json --start 0 --end 10
```

Upload devotionals 10-19:

```bash
node upload-to-notion.mjs devotionals-2026-jan.json --start 10 --end 20
```

**Useful for:**
- Testing with a small batch first
- Resuming after an error
- Uploading in chunks to avoid rate limits

### 4. Stop on First Error

Stop immediately if any upload fails:

```bash
node upload-to-notion.mjs devotionals-2026-jan.json --stop-on-error
```

By default, the script continues even if some uploads fail.

### 5. Force Override Existing Pages

If pages already exist for some dates and you want to replace them:

```bash
node upload-to-notion.mjs devotionals-2026-jan.json --force
```

Or with npm script:

```bash
npm run upload -- --force
```

⚠️ **Warning:** This will delete existing pages and create new ones. Use with caution!

## Command Line Options Summary

| Option            | Description                                         |
| ----------------- | --------------------------------------------------- |
| `--dry-run`       | Test without creating pages                         |
| `--start N`       | Start at devotional N (0-based index)               |
| `--end N`         | End at devotional N                                 |
| `--stop-on-error` | Stop immediately if any upload fails                |
| `--force`         | Override existing pages (archives old, creates new) |

**Examples:**
```bash
# Dry run
node upload-to-notion.mjs devotionals-2026-jan.json --dry-run

# Upload range with force override
node upload-to-notion.mjs devotionals-2026-jan.json --start 0 --end 10 --force

# Stop on first error
node upload-to-notion.mjs devotionals-2026-jan.json --stop-on-error
```

## Features

### ✨ Markdown Formatting Support

The script automatically converts Markdown to Notion rich text:
- `**bold text**` → **bold text** in Notion
- `*italic text*` → *italic text* in Notion

### 🚦 Rate Limiting

The script includes automatic rate limiting (350ms between requests) to respect Notion's API limits (~3 requests/second).

### 🔒 Duplicate Prevention

The script checks if a page already exists for each date before creating it. If a page exists:
- **Without `--force`**: The script will fail with an error message
- **With `--force`**: The existing page will be archived (deleted) and a new one created

This prevents accidental duplicates in your Notion database.

### 📊 Progress Tracking

You'll see real-time progress:
```
📝 Creating page for 2026-01-01: Strach z neznáma
✅ Created: Strach z neznáma (page-id-123)
📝 Creating page for 2026-01-02: Boží sľub je väčší ako ruiny
✅ Created: Boží sľub je väčší ako ruiny (page-id-456)
...
```

### 📈 Summary Report

At the end, you get a summary:
```
📊 Upload Summary:
✅ Success: 28
❌ Failed: 3
📝 Total: 31
```

## Recommended Workflow

### Step 1: Dry Run
```bash
node upload-to-notion.mjs devotionals-2026-jan.json --dry-run
```

Check that the JSON is valid and formatted correctly.

### Step 2: Test with Small Batch
```bash
node upload-to-notion.mjs devotionals-2026-jan.json --start 0 --end 3
```

Upload just 3 devotionals and check them in Notion to ensure everything looks right.

### Step 3: Upload in Batches
```bash
# Upload first 10
node upload-to-notion.mjs devotionals-2026-jan.json --start 0 --end 10

# Upload next 10
node upload-to-notion.mjs devotionals-2026-jan.json --start 10 --end 20

# Continue...
```

### Step 4: Upload Remaining
Once you're confident, upload the rest:
```bash
node upload-to-notion.mjs devotionals-2026-jan.json --start 20
```

## Troubleshooting

### Error: "VITE_NOTION_API_KEY not found"

Make sure `.env.local` exists with:
```
VITE_NOTION_API_KEY=your_key_here
VITE_NOTION_DATABASE_ID=your_db_id_here
```

### Error: "Invalid JSON"

Validate your JSON file:
```bash
node -e "JSON.parse(require('fs').readFileSync('devotionals-2026-jan.json'))"
```

### Error: "Page already exists for date..."

The script detected an existing page for that date. This prevents duplicates. Options:

1. **Skip that date**: Use `--start` and `--end` to upload only new entries
2. **Replace existing pages**: Use `--force` flag to override
3. **Manual cleanup**: Delete the existing pages in Notion first

### Error: "Property not found"

Ensure your Notion database has these properties:
- Title (Title type)
- Date (Date type)
- Quote (Rich text type)
- VerseDay (Rich text type)
- VerseEvening (Rich text type)
- Questions (Rich text type)
- Prayer (Rich text type)
- Spotify Embed URI (URL type) - optional

### Rate Limit Errors

If you hit rate limits, try:
1. Uploading in smaller batches (--start/--end)
2. Waiting a few minutes between batches

## What Gets Created

For each devotional, the script creates:

1. **Notion page properties:**
   - Title
   - Date
   - Quote (Bible reference)
   - VerseDay (morning reading)
   - VerseEvening (evening reading)
   - Questions
   - Prayer
   - Spotify Embed URI (if provided)

2. **Page content:**
   - Multiple paragraph blocks with the devotional text
   - Markdown formatting preserved as Notion rich text

## Next Steps

After upload:
1. Check a few pages in Notion to verify formatting
2. Add any Spotify URIs manually if needed
3. Test the web app to ensure everything displays correctly
4. Consider adding the script to `package.json` for easy access

## Available npm Scripts

The following scripts are already configured in `package.json`:

```bash
npm run upload:dry-run   # Test without creating pages (devotionals-2026-jan.json)
npm run upload:test      # Upload first 3 pages for testing
npm run upload           # Upload all devotionals from devotionals-2026-jan.json
npm run upload:force     # Upload all, replacing any existing pages (use with caution!)
npm run discover-schema  # Inspect your Notion database schema
```

**Note:** All scripts expect `devotionals-2026-jan.json` to exist in the project root. The script will fail with a clear error message if the file is not found.

