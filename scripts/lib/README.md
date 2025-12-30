# Upload Scripts Library

This directory contains modular components for the RSS.com episode uploader script.

## Architecture

The uploader is organized into the following modules:

### `config.js`
- **Purpose**: Configuration management and environment variable loading
- **Exports**:
  - `rssConfig` - RSS.com API credentials and settings
  - `notionConfig` - Notion API credentials and settings
  - `episodesConfig` - Episodes directory configuration
  - `validateAllConfig()` - Validates all configurations

### `rss-api.js`
- **Purpose**: RSS.com API client
- **Exports**:
  - `testCredentials()` - Tests API credentials
  - `getExistingEpisodes(limit)` - Fetches existing episodes
  - `findExistingEpisode(episodes, title, date)` - Finds episode by title/date
  - `getPresignedUploadUrl(fileName, fileSize)` - Gets S3 upload URL
  - `uploadToPresignedUrl(fileBuffer, url)` - Uploads file to S3
  - `createEpisodeWithAsset(audioId, title, date)` - Creates episode

### `notion-api.js`
- **Purpose**: Notion API client
- **Exports**:
  - `getEpisodeFromNotion(date)` - Fetches episode data by date
  - `updateNotionEmbedUri(pageId, embedUri)` - Updates Spotify embed URI

### `audio-converter.js`
- **Purpose**: Audio file format conversion utilities
- **Exports**:
  - `checkFFmpeg()` - Checks if ffmpeg is installed
  - `convertWAVtoMP3(wavPath, mp3Path)` - Converts WAV to MP3

### `episode-scanner.js`
- **Purpose**: Scans episodes directory for ready-to-upload episodes
- **Exports**:
  - `extractDateFromFolderName(folderName)` - Extracts date from folder name
  - `scanEpisodesDirectory(options)` - Scans and returns episode list

### `episode-uploader.js`
- **Purpose**: Core upload logic for individual episodes
- **Exports**:
  - `uploadAndCreateEpisode(filePath, title, date)` - Complete upload process
  - `uploadEpisode(episode, options)` - Main upload function with all checks

## Benefits of This Architecture

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Testability**: Functions can be tested in isolation
3. **Reusability**: Modules can be used by other scripts
4. **Maintainability**: Changes to one component don't affect others
5. **Readability**: The main CLI script is clean and focused on orchestration

## Usage Example

```javascript
import { validateAllConfig } from './lib/config.js'
import { testCredentials, getExistingEpisodes } from './lib/rss-api.js'
import { scanEpisodesDirectory } from './lib/episode-scanner.js'
import { uploadEpisode } from './lib/episode-uploader.js'

// Validate configuration
validateAllConfig()

// Test credentials
await testCredentials()

// Scan for episodes
const episodes = await scanEpisodesDirectory()

// Upload each episode
for (const episode of episodes) {
  await uploadEpisode(episode, { dryRun: false })
}
```

