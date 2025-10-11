# Content Import Workflow

Complete workflow for importing devotionals from Google Docs to Notion.

## Overview

```
Google Docs → HTML Export → Gemini AI → JSON → Notion Upload Script → Notion Database
```

## Step-by-Step Guide

### Step 1: Export from Google Docs

1. Open your Google Doc with devotionals
2. Go to **File** → **Download** → **Web Page (.html, zipped)**
3. Extract the ZIP file
4. You'll get an HTML file (e.g., `CHLIEB 2026 JAN.html`)

### Step 2: Parse with Gemini AI

1. Open [Gemini](https://gemini.google.com)
2. Copy the prompt from `GEMINI_PROMPT.md`
3. Paste the prompt into Gemini
4. Attach the HTML file you exported
5. Send and wait for Gemini to parse
6. Copy the JSON response
7. Save it as `devotionals-2026-jan.json` in the project root

**Important:** Make sure Gemini returns pure JSON without markdown code blocks. If it includes \`\`\`json, remove those markers.

### Step 3: Validate the JSON

```bash
node -e "JSON.parse(require('fs').readFileSync('devotionals-2026-jan.json'))"
```

If no errors, your JSON is valid! ✅

### Step 4: Dry Run Upload

Test without creating pages:

```bash
npm run upload:dry-run
```

This shows you what will be uploaded without actually creating anything.

### Step 5: Test Upload (3 pages)

Upload just a few pages to test:

```bash
npm run upload:test
```

### Step 6: Check in Notion

Go to your Notion database and verify:
- ✅ Properties are filled correctly
- ✅ Dates are correct
- ✅ Formatting looks good (bold/italic)
- ✅ Content paragraphs are separated properly
- ✅ Questions and prayers are in the right fields

### Step 7: Upload All

If everything looks good, upload all devotionals:

```bash
npm run upload
```

Or in batches for safety (using direct command):

```bash
# First 10
node upload-to-notion.mjs devotionals-2026-jan.json --start 0 --end 10

# Next 10
node upload-to-notion.mjs devotionals-2026-jan.json --start 10 --end 20

# Continue...
```

### Step 8: Verify on Website

1. Start the dev server: `npm run dev`
2. Navigate to different dates
3. Verify everything displays correctly

## Files Reference

| File                     | Purpose                                   |
| ------------------------ | ----------------------------------------- |
| `GEMINI_PROMPT.md`       | Prompt to use with Gemini AI for parsing  |
| `devotional-sample.json` | Example of expected JSON format           |
| `FORMATTING_EXAMPLE.md`  | How Markdown formatting works             |
| `upload-to-notion.mjs`   | Script to upload JSON to Notion           |
| `UPLOAD_GUIDE.md`        | Detailed usage guide for upload script    |
| `discover-schema.mjs`    | Utility to inspect Notion database schema |

## Tips & Best Practices

### ✅ Do

- Always run `--dry-run` first
- Test with a small batch before uploading all
- Keep your original Google Doc as backup
- Validate JSON before uploading
- Upload in batches to avoid issues

### ❌ Don't

- Don't commit devotional JSON files to git (they're in `.gitignore`)
- Don't upload without testing first
- Don't forget to check Notion after upload
- Don't manually edit Notion pages until all uploads are done

## Troubleshooting

### Gemini returns invalid JSON

- Remove markdown code blocks (\`\`\`json)
- Make sure it's a valid JSON array
- Check for unescaped quotes in text

### Upload fails with "Property not found"

Run the schema discovery to check your database:
```bash
node discover-schema.mjs
```

Make sure your Notion database has all required properties.

### Some pages fail to upload

- Check the error message
- Upload failed pages individually with `--start` and `--end`
- Verify the JSON data for those entries

### Formatting not preserved

- Make sure Gemini converted HTML to Markdown (`**bold**`, `*italic*`)
- Check the `devotional-sample.json` for correct format
- The upload script will convert Markdown to Notion rich text

## Advanced Usage

### Parse and Upload in One Go (Future Enhancement)

You could create a combined script that:
1. Calls Gemini API directly
2. Parses the HTML
3. Uploads to Notion

This would require:
```bash
npm install @google/generative-ai
```

And your Gemini API key in `.env.local`:
```
GEMINI_API_KEY=your_key_here
```

### Batch Processing Multiple Months

```bash
# January
node upload-to-notion.mjs devotionals-2026-jan.json

# February  
node upload-to-notion.mjs devotionals-2026-feb.json

# March
node upload-to-notion.mjs devotionals-2026-mar.json
```

## Summary

1. 📄 Export HTML from Google Docs
2. 🤖 Parse with Gemini AI → get JSON
3. ✅ Validate JSON
4. 🧪 Test with dry run
5. 📤 Upload to Notion
6. 🔍 Verify in Notion & website

That's it! Your devotionals are now in Notion and will appear on your website.

