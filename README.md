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
- **CMS**: Strapi with blocks renderer
- **Code Quality**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies (use --ignore-scripts to avoid postinstall errors):
```bash
npm install --ignore-scripts
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

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

## Strapi CMS Integration

The application is ready to integrate with Strapi headless CMS. Follow the detailed setup guide in [STRAPI_SETUP_GUIDE.md](./STRAPI_SETUP_GUIDE.md).

### Quick Start

1. **Set up Strapi** (see [STRAPI_SETUP_GUIDE.md](./STRAPI_SETUP_GUIDE.md))
   - Use Strapi Cloud (easiest) or run locally
   - Create the Devotional content type
   - Add test content

2. **Configure the app**:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   VITE_STRAPI_API_URL=https://your-project-name.strapiapp.com/api
   VITE_STRAPI_API_TOKEN=your_api_token_here
   ```

3. **Restart the dev server**:
   ```bash
   npm run dev
   ```

The app will now fetch devotionals from your Strapi CMS!

### Content Model

The required content model is:

### Devotional Episode Content Type

| Field Name      | Type       | Description                           | Required |
| --------------- | ---------- | ------------------------------------- | -------- |
| date            | Date       | The day this devotional is published  | Yes      |
| title           | Short Text | The title of the day's devotional     | Yes      |
| scripture       | Short Text | The main scripture verse reference    | Yes      |
| text            | Rich Text  | The full body text (HTML supported)   | Yes      |
| spotifyEmbedUri | URL        | The Spotify embed URL for the episode | Yes      |

### Authentication

The app uses Strapi API tokens for secure authentication:

- **API Token**: Created in Strapi admin panel (Settings → API Tokens)
- **Read-only access**: Use "Read-only" token type for security
- **No public exposure**: Token is only used server-side during build/fetch

## Deployment

The application can be deployed to any static hosting service:

- **Vercel**: `npm run build` and deploy the `dist` folder
- **Netlify**: Connect your repo and set build command to `npm run build`
- **Firebase Hosting**: `firebase init` and deploy

## Project Structure

```
chliebnaskazdodenny-web/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles and Tailwind
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── tailwind.config.js   # Tailwind configuration
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

