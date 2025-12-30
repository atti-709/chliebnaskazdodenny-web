# Upload Script Refactoring Notes

## Overview

The `upload-to-rss.mjs` script has been refactored from a monolithic 745-line file into a modular architecture with separate, focused modules in the `lib/` directory.

## Changes Made

### Before
- Single 745-line file with all functionality mixed together
- Hard to test individual components
- Difficult to reuse code in other scripts
- Poor separation of concerns

### After
- Main CLI script: **156 lines** (79% reduction)
- 6 focused library modules in `lib/` directory
- Clear separation of concerns
- Easy to test and maintain
- Reusable components

## Module Structure

```
scripts/
├── upload-to-rss.mjs          (Main CLI - orchestration only)
└── lib/
    ├── config.js              (Configuration management)
    ├── rss-api.js             (RSS.com API client)
    ├── notion-api.js          (Notion API client)
    ├── audio-converter.js     (Audio conversion utilities)
    ├── episode-scanner.js     (Directory scanning logic)
    ├── episode-uploader.js    (Upload orchestration)
    └── README.md              (Library documentation)
```

## Module Responsibilities

### 1. `config.js` (67 lines)
**Purpose**: Centralized configuration and environment variable management

**Exports**:
- `rssConfig` - RSS.com API settings
- `notionConfig` - Notion API settings
- `episodesConfig` - Episodes directory path
- `validateAllConfig()` - Validates all configurations

**Benefits**:
- Single source of truth for configuration
- Easy to add new config options
- Validation logic in one place

### 2. `rss-api.js` (235 lines)
**Purpose**: Complete RSS.com API client

**Exports**:
- `testCredentials()` - Validates API credentials
- `getExistingEpisodes(limit)` - Fetches existing episodes
- `findExistingEpisode(episodes, title, date)` - Finds duplicates
- `getPresignedUploadUrl(fileName, fileSize)` - Gets S3 upload URL
- `uploadToPresignedUrl(fileBuffer, url)` - Uploads to S3
- `createEpisodeWithAsset(audioId, title, date)` - Creates episode

**Benefits**:
- All RSS.com API logic in one place
- Can be reused by other scripts
- Easy to test API interactions
- Clear error handling

### 3. `notion-api.js` (98 lines)
**Purpose**: Notion API client for episode data

**Exports**:
- `getEpisodeFromNotion(date)` - Fetches episode by date
- `updateNotionEmbedUri(pageId, embedUri)` - Updates embed URI

**Benefits**:
- Isolated Notion integration
- Easy to modify Notion queries
- Can be reused for other Notion operations

### 4. `audio-converter.js` (57 lines)
**Purpose**: Audio format conversion using ffmpeg

**Exports**:
- `checkFFmpeg()` - Checks if ffmpeg is available
- `convertWAVtoMP3(wavPath, mp3Path)` - Converts audio files

**Benefits**:
- Isolated ffmpeg dependency
- Easy to add other audio formats
- Can be tested independently

### 5. `episode-scanner.js` (113 lines)
**Purpose**: Scans episodes directory for ready episodes

**Exports**:
- `extractDateFromFolderName(folderName)` - Parses folder names
- `scanEpisodesDirectory(options)` - Scans and filters episodes

**Benefits**:
- Clear directory scanning logic
- Easy to modify folder structure requirements
- Testable with mock filesystem

### 6. `episode-uploader.js` (177 lines)
**Purpose**: Core upload logic for individual episodes

**Exports**:
- `uploadAndCreateEpisode(filePath, title, date)` - Complete upload
- `uploadEpisode(episode, options)` - Main upload with checks

**Benefits**:
- Orchestrates the complete upload flow
- Handles duplicate detection
- Manages WAV conversion
- Updates Notion after upload

## Main CLI Script

The refactored `upload-to-rss.mjs` is now focused purely on:
1. Command-line argument parsing
2. Orchestrating the upload workflow
3. Progress tracking and reporting
4. Error handling and exit codes

**Key improvements**:
- Clean, readable main function
- No business logic mixed with CLI concerns
- Easy to understand the overall flow

## Benefits of This Refactoring

### 1. **Maintainability**
- Each module has a single responsibility
- Changes to one component don't affect others
- Easier to understand and modify

### 2. **Testability**
- Functions can be unit tested in isolation
- Mock dependencies easily
- Test edge cases without running full script

### 3. **Reusability**
- Modules can be imported by other scripts
- RSS.com API client can be used elsewhere
- Notion client available for other operations

### 4. **Readability**
- Main script shows high-level flow
- Implementation details hidden in modules
- Clear module boundaries

### 5. **Scalability**
- Easy to add new features
- Can extend modules without breaking others
- Clear place for new functionality

## Migration Guide

### Old Code
```javascript
// Everything in one file
const RSS_API_KEY = process.env.RSS_API_KEY
// ... 700+ more lines
```

### New Code
```javascript
// Clean imports
import { validateAllConfig } from './lib/config.js'
import { testCredentials, getExistingEpisodes } from './lib/rss-api.js'
import { uploadEpisode } from './lib/episode-uploader.js'

// Use the modules
validateAllConfig()
await testCredentials()
await uploadEpisode(episode, options)
```

## Testing Strategy

With this modular structure, you can now:

1. **Unit test individual modules**:
   ```javascript
   import { extractDateFromFolderName } from './lib/episode-scanner.js'
   
   assert.equal(extractDateFromFolderName('20240101_test'), '2024-01-01')
   ```

2. **Mock dependencies**:
   ```javascript
   // Mock RSS API for testing uploader
   import * as rssApi from './lib/rss-api.js'
   rssApi.testCredentials = () => Promise.resolve(true)
   ```

3. **Integration test the full flow**:
   ```javascript
   // Test with real APIs in staging environment
   import { main } from './upload-to-rss.mjs'
   await main()
   ```

## Future Improvements

Now that the code is modular, these improvements are easier:

1. **Add TypeScript types** - Each module can have its own type definitions
2. **Add retry logic** - Enhance `rss-api.js` with exponential backoff
3. **Add progress bars** - Enhance main script with visual progress
4. **Add logging** - Replace console.log with proper logger
5. **Add caching** - Cache Notion queries to reduce API calls
6. **Add parallel uploads** - Upload multiple episodes concurrently
7. **Add validation** - Validate audio files before upload
8. **Add rollback** - Delete episode if Notion update fails

## Backward Compatibility

The refactored script maintains 100% backward compatibility:
- Same command-line interface
- Same environment variables
- Same behavior and output
- Same error messages

Users don't need to change anything - the script works exactly the same way, just with better internal structure.

## Performance

No performance impact:
- Same number of API calls
- Same upload process
- Same rate limiting
- Module imports are negligible overhead

## Conclusion

This refactoring transforms a monolithic script into a maintainable, testable, and reusable codebase without changing any external behavior. The investment in better structure will pay dividends in easier maintenance, fewer bugs, and faster feature development.

