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
VITE_NOTION_API_KEY=your_notion_api_key_here
VITE_NOTION_DATABASE_ID=your_notion_database_id_here
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run lint:fix # Auto-fix ESLint issues
npm run format   # Format code with Prettier
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Notion Integration

The application uses Notion as a backend database. Follow the detailed setup guide in [NOTION_SETUP.md](./NOTION_SETUP.md).

### Quick Start

1. **Set up Notion** (see [NOTION_SETUP.md](./NOTION_SETUP.md))
   - Create a Notion integration
   - Create a database with the required properties
   - Share the database with your integration

2. **Configure the app**:
   
   Create `.env.local` file:
   ```env
   VITE_NOTION_API_KEY=your_notion_api_key_here
   VITE_NOTION_DATABASE_ID=your_notion_database_id_here
   ```

3. **Restart the dev server**:
   ```bash
   npm run dev
   ```

The app will now fetch devotionals from your Notion database!

### Database Schema

The required Notion database properties are:

| Property Name     | Type      | Description                             |
| ----------------- | --------- | --------------------------------------- |
| Title             | Title     | The devotional title                    |
| Date              | Date      | The devotional date (YYYY-MM-DD format) |
| Scripture         | Rich text | The scripture reference                 |
| Spotify Embed URI | URL       | The Spotify embed URI                   |

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

© 2025 Chlieb náš každodenný. All rights reserved.

