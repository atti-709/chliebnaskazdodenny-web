# Architecture Overview

## Application Architecture (After Refactoring)

### Component Hierarchy

```
App (45 lines)
├── Header
│   ├── DateNavigation
│   │   ├── ChevronLeftIcon
│   │   └── ChevronRightIcon
│   └── DatePicker
│
├── Main Content (conditional rendering)
│   ├── LoadingSpinner (if loading)
│   ├── DevotionalContent (if data available)
│   │   ├── Title & Scripture
│   │   ├── SpotifyPlayer
│   │   └── NotionBlocksRenderer
│   │       └── (various block components)
│   └── EmptyState (if no data)
│       └── BookIcon
│
└── Footer
```

### Data Flow

```
User Interaction
       ↓
useDateNavigation Hook
       ↓
Date State Update
       ↓
useDevotional Hook (monitors date changes)
       ↓
API Client (notion.ts)
       ↓
Serverless Function or Dev Server
       ↓
Notion API Utilities (shared conversion)
       ↓
Notion API
       ↓
Formatted Data
       ↓
Component Rendering
```

### File Structure with Responsibilities

```
src/
├── App.jsx                          [Main app container - 45 lines]
│
├── components/
│   ├── Header.jsx                   [Header wrapper]
│   ├── DateNavigation.jsx           [Navigation controls]
│   ├── DatePicker.jsx               [Date input]
│   ├── DevotionalContent.jsx        [Content display]
│   ├── SpotifyPlayer.jsx            [Spotify embed]
│   ├── LoadingSpinner.jsx           [Loading UI]
│   ├── EmptyState.jsx               [Empty/error UI]
│   ├── Footer.jsx                   [Footer]
│   ├── icons.jsx                    [SVG icons]
│   │
│   └── NotionBlocksRenderer/        [Notion content renderer]
│       ├── index.tsx                [Main export]
│       ├── NotionBlockComponent.tsx [Block type router]
│       ├── RichText.tsx             [Text array renderer]
│       ├── NotionTextNode.tsx       [Single text node]
│       ├── annotations.tsx          [Text styling]
│       └── utils.tsx                [List grouping logic]
│
├── hooks/
│   ├── useDevotional.js             [Data fetching logic]
│   └── useDateNavigation.js         [Navigation state logic]
│
├── utils/
│   ├── notion.js                    [Shared Notion utilities]
│   └── constants.js                 [App configuration]
│
└── api/
    ├── notion.ts                    [API client]
    └── notion.types.ts              [TypeScript types]
```

### API Layer Architecture

```
Frontend (React)
    ↓
API Client (notion.ts)
    ↓
    ├─→ Development: server-simple.js (Vite middleware)
    │       ↓
    │   Notion Utilities (utils/notion.js)
    │       ↓
    │   Notion API (direct HTTP)
    │
    └─→ Production: api/devotionals.js (Serverless)
            ↓
        Notion Utilities (utils/notion.js)
            ↓
        Notion API (@notionhq/client)
```

## Key Architectural Principles

### 1. Separation of Concerns

- **UI Components**: Pure presentational logic
- **Hooks**: Business logic and state management
- **Utilities**: Pure functions for data transformation
- **API Layer**: External communication

### 2. Single Responsibility

Each file/component has one clear purpose:

- Header manages header UI only
- useDevotional manages data fetching only
- notion.js handles data conversion only

### 3. Don't Repeat Yourself (DRY)

- Shared utilities eliminate duplication
- Reusable components reduce code redundancy
- Constants prevent magic numbers/strings

### 4. Composition Over Inheritance

- Small components compose into larger ones
- Hooks compose into components
- Utilities are composed for complex operations

### 5. Unidirectional Data Flow

```
State Change → Hook Update → Component Re-render → UI Update
```

## Deployment Architecture

### Development

```
npm run dev
    ↓
Vite Dev Server
    ↓
server-simple.js Plugin
    ↓
Notion API
```

### Production (Vercel/Netlify)

```
Static Build (npm run build)
    ↓
CDN (Static Assets)
    +
Serverless Functions (api/devotionals.js)
    ↓
Notion API
```

## Benefits of This Architecture

### 1. Maintainability

- Easy to locate code by responsibility
- Changes are localized to specific files
- Clear dependency chains

### 2. Testability

- Components can be unit tested
- Hooks can be tested independently
- Utilities are pure functions (easy to test)

### 3. Scalability

- Easy to add new components
- Easy to add new hooks
- Easy to add new utilities
- New features don't break existing code

### 4. Performance

- Component-level optimization possible
- Lazy loading can be added easily
- Memoization can be applied selectively

### 5. Developer Experience

- Predictable file locations
- Clear naming conventions
- Easy to onboard new developers
- Self-documenting structure

## Technology Stack

### Frontend

- **React 18** - UI library
- **Vite 5** - Build tool and dev server
- **TailwindCSS 3** - Styling
- **date-fns 2** - Date manipulation

### Backend/API

- **Notion API** - Content management
- **Serverless Functions** - API endpoints
- **Node.js** - Runtime environment

### Development

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type definitions

## Future Scalability

This architecture supports future enhancements:

1. **State Management**: Easy to add Redux/Zustand if needed
2. **Routing**: Can add React Router for multi-page app
3. **Testing**: Structure supports Jest/React Testing Library
4. **i18n**: Easy to add internationalization
5. **PWA**: Structure supports service workers
6. **Caching**: Can add React Query or SWR
7. **Analytics**: Easy to integrate tracking
8. **Error Tracking**: Can add Sentry or similar

## Migration Path from Strapi

✅ **Completed**: Full migration to Notion

- Removed all Strapi dependencies
- Direct Notion integration
- No CMS backend required
- Serverless architecture

The application is now:

- ✅ Independent of Strapi
- ✅ Fully refactored
- ✅ Production-ready
- ✅ Well-architected for future growth
