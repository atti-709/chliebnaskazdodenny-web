# Notion Setup Guide

This application now uses Notion as the backend instead of Strapi. Follow these steps to set up your Notion integration:

## 1. Create a Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Give it a name (e.g., "Chlieb náš každodenný")
4. Select the workspace where your devotional database is located
5. Click "Submit"
6. Copy the "Internal Integration Token" - this is your `NOTION_API_KEY`

## 2. Create a Notion Database

Devotionals are stored in **one database per year** (e.g. "Epizódy 2026", "Epizódy 2027"),
all with the same schema. See [Yearly Rollover](#9-yearly-rollover-new-years-database) for
adding the next year.

Create a database in Notion with the following properties:

- **Title** (Title) - The devotional title
- **Date** (Date) - The devotional date
- **Quote** (Rich text) - The quote reference
- **Spotify Embed URI** (URL) - The Spotify embed URI
- **VerseDay** (Rich text) - Bible passage for today's reading (optional)
- **VerseEvening** (Rich text) - Bible passage for evening reading (optional)
- **Questions** (Rich text) - Reflection questions (optional)
- **Prayer** (Rich text) - Prayer text (optional)
- **Text** (Page content) - The devotional content (written as Notion blocks)

## 3. Share Database with Integration

1. Open your devotional database in Notion
2. Click "Share" in the top right
3. Click "Invite" and search for your integration name
4. Select your integration and click "Invite"

## 4. Get Database ID

1. Open your database in Notion
2. Copy the URL from your browser
3. Extract the database ID from the URL:
   - Format: `https://www.notion.so/your-workspace/DATABASE_ID?v=VIEW_ID`
   - The database ID is the 32-character string before the `?v=`

## 5. Set Environment Variables

Create a `.env.local` file in the project root with:

```
NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_IDS=2026:your_2026_database_id,2027:your_2027_database_id
```

`NOTION_DATABASE_IDS` maps each year to its database as comma-separated `YEAR:DATABASE_ID`
pairs (spaces around entries are ignored). How it is used:

- **Website** (`api/devotionals.js`): a single day is read from the database of that day's
  year (a year without a database simply shows "not found"); the list of available dates
  and `getAll` are merged from all databases.
- **Scripts** (`scripts/`): each episode/devotional uses the database of its date's year.
  Episode numbers restart every year (1 January is #1), and every year is its own iTunes
  season on RSS.com (2026 = season 1, 2027 = season 2, ...).

**Legacy:** a single `NOTION_DATABASE_ID=...` still works and is then used for every year.
It is ignored as soon as `NOTION_DATABASE_IDS` is set.

**Important for Deployment:**

- On Vercel/Netlify, add these environment variables in your project settings
- Make sure to set them as "Production" and "Preview" environment variables
- Do NOT commit the `.env.local` file to your repository

## 6. Database Schema

Your Notion database should have these properties:

| Property Name     | Type      | Required | Description                                                    |
| ----------------- | --------- | -------- | -------------------------------------------------------------- |
| Title             | Title     | Yes      | The devotional title                                           |
| Date              | Date      | Yes      | The devotional date (YYYY-MM-DD format)                        |
| Quote             | Rich text | Yes      | The quote reference (e.g., "Marek 2:17") - verse from VerseDay |
| Spotify Embed URI | URL       | No       | The Spotify embed URI                                          |
| VerseDay          | Rich text | No       | Bible passage for today's reading (source of the quote)        |
| VerseEvening      | Rich text | No       | Bible passage for evening reading ("Večerné čítanie")          |
| Questions         | Rich text | No       | Reflection questions for readers                               |
| Prayer            | Rich text | No       | Prayer text                                                    |

The devotional content should be written directly in the page content area using Notion's rich text editor.

### Display Order in UI

The fields will be displayed in this order:
1. Title and Quote (at the top)
2. Bible References in two-column layout (side by side on desktop, stacked on mobile):
   - VerseDay (if provided) - labeled as "Čítanie" - warm amber color - the full passage that the quote comes from
   - VerseEvening (if provided) - labeled as "Večerné čítanie" - gray color - evening Bible reading
3. Spotify Player (if URI provided)
4. Main devotional text content
5. Questions (if provided) - labeled as "Otázky na zamyslenie"
6. Prayer (if provided) - labeled as "Modlitba"

## 7. Architecture Notes

The application uses a **serverless function architecture**:

- **Frontend**: React app that calls `/api/devotionals` endpoint
- **Backend**: Serverless function (Vercel/Netlify) that queries Notion API
- **Local Development**: Vite plugin that mimics the serverless function

This approach keeps your Notion API key secure on the server side and prevents CORS issues.

## 8. Migration from Strapi

If you're migrating from Strapi, you'll need to:

1. Export your devotional data from Strapi
2. Create corresponding pages in your Notion database
3. Copy the content from Strapi's rich text format to Notion's block format
4. Update the environment variables as described above

## 9. Yearly Rollover (New Year's Database)

Before the first episode of a new year (example: 2028):

1. **Create the database** – in Notion, duplicate last year's "Epizódy" database without
   its content (or create a new one) so that it has exactly the same properties as in
   [Database Schema](#6-database-schema). Check it with
   `node scripts/discover-schema.mjs` (prints every configured database).
2. **Share it with the integration** – Share → Invite → your integration (see step 3).
   Until it is shared, the website skips that year and logs an error.
3. **Copy its database ID** (see step 4).
4. **Add the year to `NOTION_DATABASE_IDS`** – append `,2028:<new database id>` and keep all
   previous years:
   - **Netlify**: Site configuration → Environment variables → `NOTION_DATABASE_IDS` →
     edit the value, then trigger a redeploy (Deploys → Trigger deploy) so the functions pick it up.
   - **Local**: update `NOTION_DATABASE_IDS` in `.env.local` (used by `npm run dev` and all
     scripts).
5. **Put the audio in `EPIZÓDY/2028/`** on the shared drive
   (`EPIZÓDY/2028/20280101_slug/{SRC,FINAL}`). The upload scripts scan all year folders, or
   only one with `--year 2028`.
6. **Upload the devotionals** – `node scripts/upload-to-notion.mjs devotionals-2028.json --dry-run`
   shows which database each devotional goes to; it refuses to start if a year has no
   database configured.

The website needs no code change: dates from the new database appear in the date picker
automatically.
