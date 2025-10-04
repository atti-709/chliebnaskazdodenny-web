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
- **CMS**: Ready for integration with Contentful or Strapi

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## CMS Integration

The application is structured to easily integrate with a headless CMS. The required content model is:

### Devotional Episode Content Type

| Field Name      | Type       | Description                           | Required |
| --------------- | ---------- | ------------------------------------- | -------- |
| date            | Date       | The day this devotional is published  | Yes      |
| title           | Short Text | The title of the day's devotional     | Yes      |
| scripture       | Short Text | The main scripture verse reference    | Yes      |
| devotionalText  | Rich Text  | The full body text (HTML supported)   | Yes      |
| spotifyEmbedUri | URL        | The Spotify embed URL for the episode | Yes      |

### Integration Steps

1. **Set up your CMS** (Contentful, Strapi, or similar)
2. **Create the content model** with the fields above
3. **Get your API credentials** (endpoint URL and API key)
4. **Create a `.env` file** in the project root:
```env
VITE_CMS_API_URL=your_cms_api_url
VITE_CMS_API_KEY=your_cms_api_key
```
5. **Update the `getDevotionalByDate` function** in `src/App.jsx` to fetch from your CMS

### Example CMS API Integration (Contentful)

```javascript
const getDevotionalByDate = async (dateString) => {
  const response = await fetch(
    `${import.meta.env.VITE_CMS_API_URL}/entries?content_type=devotional&fields.date=${dateString}`,
    {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CMS_API_KEY}`
      }
    }
  )
  const data = await response.json()
  return data.items[0]?.fields || null
}
```

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

