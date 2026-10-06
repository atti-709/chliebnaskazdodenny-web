# Chlieb náš každodenný (Our Daily Bread)

A beautiful, minimalistic devotional web application for daily spiritual readings.

## Features

- 📖 Daily devotional content with rich text formatting
- 🎵 Integrated Spotify podcast player
- 📅 Intuitive date navigation with calendar picker
- 📱 Fully responsive, mobile-first design
- 🎨 Clean, minimalistic aesthetic with elegant typography
- ⚡ Fast, fluid animations and transitions

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Date Handling**: date-fns
- **Backend**: Notion API
- **Code Quality**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up your environment variables (see [NOTION_SETUP.md](./NOTION_SETUP.md)):

```bash
# Create .env.local file
NOTION_API_KEY=your_notion_api_key_here
# One Notion database per year (YEAR:DATABASE_ID, comma-separated)
NOTION_DATABASE_IDS=2026:your_2026_database_id,2027:your_2027_database_id
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Available Commands

```bash
# Development
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build

# Code Quality
npm run lint     # Run ESLint
npm run lint:fix # Auto-fix ESLint issues
npm run format   # Format code with Prettier

# Audio Conversion
npm run convert:wav-dry  # Preview WAV to MP3 conversions
npm run convert:wav      # Convert all WAV files to MP3

# RSS.com Upload
npm run rss:dry-run    # Test RSS.com upload without uploading
npm run rss:upload     # Upload episodes to RSS.com (skips duplicates)
npm run rss:force      # Force upload (even if already exists)
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Podcast Publishing

This project includes automated tools for publishing podcast episodes:

- **Notion Integration**: Content management for episode metadata
- **RSS.com Upload**: Automated episode uploading to RSS.com
- **Spotify Sync**: Automatic syncing of Spotify embeds via Vercel cron jobs

### Quick Start Guides

1. [RSS.com Upload Guide](./RSS_UPLOAD_GUIDE.md) - Upload episodes to RSS.com
2. [Spotify Sync Guide](./SPOTIFY_SYNC_GUIDE.md) - Set up automatic Spotify embed syncing

## Notion Integration

The application uses Notion as a backend database. Follow the detailed setup guide in [NOTION_SETUP.md](./NOTION_SETUP.md).

### Quick Start

1. **Set up Notion** (see [NOTION_SETUP.md](./NOTION_SETUP.md))
   - Create a Notion integration
   - Create a database with the required properties (one database per year)
   - Share the database with your integration

2. **Configure the app**:

   Create `.env.local` file:

   ```env
   NOTION_API_KEY=your_notion_api_key_here
   NOTION_DATABASE_IDS=2026:your_2026_database_id,2027:your_2027_database_id
   
   # Optional: For RSS.com upload automation
   RSS_CLIENT_ID=your_rss_client_id
   RSS_CLIENT_SECRET=your_rss_client_secret
   ```

3. **Restart the dev server**:
   ```bash
   npm run dev
   ```

### New Year

Each year has its own Notion database. To add a year: create the database with the same
schema, share it with the integration, append `,YEAR:<id>` to `NOTION_DATABASE_IDS` in
Netlify (then redeploy) and in `.env.local`, and put the audio in `EPIZÓDY/<YEAR>/`.
See [NOTION_SETUP.md → Yearly Rollover](./NOTION_SETUP.md#9-yearly-rollover-new-years-database).

The app will now fetch devotionals from your Notion database!

### Database Schema

The required Notion database properties are:

| Property Name     | Type      | Description                                   |
| ----------------- | --------- | --------------------------------------------- |
| Title             | Title     | The devotional title                          |
| Date              | Date      | The devotional date (YYYY-MM-DD format)       |
| Quote             | Rich text | The quote reference                           |
| Spotify Embed URI | URL       | The RSS.com player embed URI (or Spotify URI) |

The devotional content should be written in the page content area using Notion blocks.

### Authentication

The app uses Notion API for secure authentication:

- **API Token**: Created in Notion integrations page
- **Read-only access**: Integration only needs read access to the database
- **No public exposure**: Token is only used in API calls from the frontend

## Deployment

The application can be deployed to any static hosting service:

- **Vercel**: `npm run build` and deploy the `dist` folder
- **Netlify**: Connect your repo and set build command to `npm run build`
- **Firebase Hosting**: `firebase init` and deploy

## Project Structure

```
chliebnaskazdodenny-web/
├── src/
│   ├── api/
│   │   ├── notion.ts          # Notion API client
│   │   └── notion.types.ts    # TypeScript types for Notion
│   ├── components/
│   │   └── NotionBlocksRenderer.tsx  # Notion blocks renderer
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles and Tailwind
├── index.html                 # HTML template
├── package.json               # Dependencies
├── vite.config.js             # Vite configuration
└── tailwind.config.js         # Tailwind configuration
```

## Design Philosophy

The application follows a minimalistic, fluid design inspired by elegant reading experiences:

- **Typography**: Merriweather serif for devotional content, Inter sans-serif for UI
- **Color Palette**: Clean whites (#F9F9F9) with soft green accent (#8B9D83)
- **Layout**: Centered content with optimal reading width
- **Animations**: Smooth, subtle transitions for a polished feel

## Scripts

The project includes several utility scripts for managing podcast episodes:

### Episode Upload

```bash
# Upload episodes to RSS.com
node scripts/upload-to-rss.mjs [options]

Options:
  --dry-run          Show what would be uploaded without uploading
  --start-date       Start date (YYYY-MM-DD) for episodes to upload
  --end-date         End date (YYYY-MM-DD) for episodes to upload
  --year             Only scan EPIZÓDY/<YYYY>/ (default: all year folders)
  --force            Upload even if episode already exists
```

Episode audio is read from `EPIZÓDY/<YYYY>/<YYYYMMDD_slug>/FINAL/` on the shared drive, and
each episode's title comes from the Notion database for its year.

### RSS.com Player URL Sync

```bash
# Sync RSS.com player URLs to Notion
node scripts/sync-rss-player-urls.mjs [options]

Options:
  --dry-run          Preview what would be updated
  --start-date       Start date (YYYY-MM-DD) to filter episodes
  --end-date         End date (YYYY-MM-DD) to filter episodes
  --limit            Number of episodes to fetch (default: 100)
```

### Episode Inspection

```bash
# Inspect RSS.com API response for debugging
node scripts/inspect-rss-episode.mjs [episode-number]
```

See [RSS_PLAYER_SYNC_GUIDE.md](scripts/RSS_PLAYER_SYNC_GUIDE.md) for detailed documentation.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

© 2025 Chlieb náš každodenný. All rights reserved.
