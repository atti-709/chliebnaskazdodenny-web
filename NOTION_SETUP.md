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
NOTION_DATABASE_ID=your_notion_database_id_here
```

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
