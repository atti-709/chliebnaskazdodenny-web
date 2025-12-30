# Upload Script Architecture

## Module Dependency Graph

```
upload-to-rss.mjs (CLI Entry Point)
│
├─→ lib/config.js
│   └─→ Environment Variables (.env.local)
│
├─→ lib/rss-api.js
│   └─→ lib/config.js (rssConfig)
│
├─→ lib/notion-api.js
│   └─→ lib/config.js (notionConfig)
│
├─→ lib/audio-converter.js
│   └─→ ffmpeg (system dependency)
│
├─→ lib/episode-scanner.js
│   └─→ lib/config.js (episodesConfig)
│
└─→ lib/episode-uploader.js
    ├─→ lib/rss-api.js
    ├─→ lib/notion-api.js
    └─→ lib/audio-converter.js
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     upload-to-rss.mjs (CLI)                     │
│  • Parse command-line arguments                                 │
│  • Validate configuration                                       │
│  • Orchestrate upload workflow                                  │
│  • Track progress and report results                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    lib/episode-scanner.js                       │
│  • Scan episodes directory                                      │
│  • Find FINAL folders                                           │
│  • Detect audio files (MP3, M4A, WAV)                          │
│  • Extract dates from folder names                              │
│  • Apply date filters                                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    [List of Episodes]
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   lib/episode-uploader.js                       │
│  For each episode:                                              │
│    1. Fetch title from Notion                                   │
│    2. Check for duplicates                                      │
│    3. Convert WAV to MP3 if needed                             │
│    4. Upload to RSS.com                                         │
│    5. Update Notion with embed URI                              │
└──────┬──────────────┬──────────────┬──────────────┬────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐
  │ Notion  │  │ RSS.com  │  │  Audio   │  │   File     │
  │   API   │  │   API    │  │Converter │  │  System    │
  └─────────┘  └──────────┘  └──────────┘  └────────────┘
```

## Upload Process Flow

```
START
  │
  ├─→ [1] Validate Configuration
  │   └─→ Check env vars (RSS_API_KEY, NOTION_API_KEY, etc.)
  │
  ├─→ [2] Test API Credentials
  │   └─→ Make test request to RSS.com API
  │
  ├─→ [3] Check ffmpeg
  │   └─→ Verify ffmpeg is available for WAV conversion
  │
  ├─→ [4] Scan Episodes Directory
  │   ├─→ Find folders with FINAL subfolder
  │   ├─→ Detect audio files (MP3, M4A, WAV)
  │   ├─→ Extract dates from folder names
  │   └─→ Apply date filters (--start-date, --end-date)
  │
  ├─→ [5] Get Existing Episodes from RSS.com
  │   └─→ Fetch list for duplicate detection
  │
  └─→ [6] For Each Episode:
      │
      ├─→ [6.1] Fetch Episode Data from Notion
      │   └─→ Query by date to get title
      │
      ├─→ [6.2] Check for Duplicates
      │   ├─→ If exists and not --force: SKIP
      │   └─→ If --force or new: CONTINUE
      │
      ├─→ [6.3] Prepare Audio File
      │   ├─→ If WAV: Convert to MP3
      │   └─→ If MP3/M4A: Use as-is
      │
      ├─→ [6.4] Upload to RSS.com (3-step process)
      │   ├─→ Step 1: Get presigned S3 URL
      │   ├─→ Step 2: Upload file to S3
      │   └─→ Step 3: Create episode with asset ID
      │
      ├─→ [6.5] Update Notion
      │   └─→ Set Spotify Embed URI field
      │
      ├─→ [6.6] Wait 2 seconds (rate limiting)
      │
      └─→ NEXT EPISODE
  │
END
  └─→ Print Summary (success, skipped, failed counts)
```

## Module Interfaces

### config.js
```javascript
export const rssConfig = {
  apiKey: string,
  podcastId: string,
  apiBase: string,
  validate(): void
}

export const notionConfig = {
  apiKey: string,
  databaseId: string,
  version: string,
  validate(): void
}

export const episodesConfig = {
  path: string
}

export function validateAllConfig(): void
```

### rss-api.js
```javascript
export async function testCredentials(): Promise<boolean>

export async function getExistingEpisodes(limit?: number): Promise<Episode[]>

export function findExistingEpisode(
  existingEpisodes: Episode[],
  title: string,
  date: string
): Episode | undefined

export async function getPresignedUploadUrl(
  fileName: string,
  fileSize: number
): Promise<{ uploadUrl: string, assetId: string }>

export async function uploadToPresignedUrl(
  fileBuffer: Buffer,
  presignedUrl: string
): Promise<void>

export async function createEpisodeWithAsset(
  audioId: string,
  title: string,
  date: string
): Promise<{ episodeId: string, playerUrl: string, permalink: string }>
```

### notion-api.js
```javascript
export async function getEpisodeFromNotion(
  date: string
): Promise<{ pageId: string, title: string } | null>

export async function updateNotionEmbedUri(
  pageId: string,
  embedUri: string
): Promise<boolean>
```

### audio-converter.js
```javascript
export async function checkFFmpeg(): Promise<boolean>

export async function convertWAVtoMP3(
  wavPath: string,
  mp3Path: string
): Promise<void>
```

### episode-scanner.js
```javascript
export function extractDateFromFolderName(
  folderName: string
): string | null

export async function scanEpisodesDirectory(
  options?: {
    startDate?: string,
    endDate?: string
  }
): Promise<Episode[]>

type Episode = {
  date: string,
  folderName: string,
  audioFile: string,
  audioFilePath: string,
  fileSize: number,
  fileSizeMB: string,
  needsConversion: boolean
}
```

### episode-uploader.js
```javascript
export async function uploadAndCreateEpisode(
  filePath: string,
  title: string,
  date: string
): Promise<{ episodeId: string, playerUrl: string, permalink: string }>

export async function uploadEpisode(
  episode: Episode,
  options?: {
    dryRun?: boolean,
    force?: boolean,
    existingEpisodes?: Episode[]
  }
): Promise<{
  success: boolean,
  skipped?: boolean,
  dryRun?: boolean,
  reason?: string,
  data?: any,
  error?: string
}>
```

## Error Handling Strategy

Each module handles errors at its level:

1. **config.js**: Throws errors for missing configuration
2. **rss-api.js**: Throws errors for API failures with detailed messages
3. **notion-api.js**: Returns null for not found, throws for API errors
4. **audio-converter.js**: Throws errors for conversion failures
5. **episode-scanner.js**: Logs warnings for invalid folders, throws for directory access errors
6. **episode-uploader.js**: Returns result object with success/error status
7. **upload-to-rss.mjs**: Catches all errors and exits with appropriate code

## Configuration Sources

```
.env.local (Environment Variables)
  │
  ├─→ RSS_API_KEY
  ├─→ RSS_PODCAST_ID
  ├─→ NOTION_API_KEY
  └─→ NOTION_DATABASE_ID
      │
      ▼
  lib/config.js (Configuration Objects)
      │
      ├─→ rssConfig
      ├─→ notionConfig
      └─→ episodesConfig
          │
          ▼
  Used by all modules
```

## Testing Layers

```
┌─────────────────────────────────────┐
│   Integration Tests                 │
│   • Test full upload workflow       │
│   • Use staging environment         │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Module Tests                      │
│   • Test each module independently  │
│   • Mock external dependencies      │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Unit Tests                        │
│   • Test individual functions       │
│   • Pure logic, no I/O              │
└─────────────────────────────────────┘
```

## Performance Considerations

1. **Rate Limiting**: 2-second delay between uploads
2. **Memory**: Files loaded into memory for upload (consider streaming for large files)
3. **Concurrency**: Sequential uploads (could be parallelized in future)
4. **Caching**: No caching currently (could cache Notion queries)
5. **Network**: 3 API calls per episode (Notion, RSS.com presigned URL, RSS.com create)

## Security Considerations

1. **Credentials**: Stored in `.env.local` (not committed to git)
2. **API Keys**: Masked in console output (first 8 + last 4 chars shown)
3. **File Access**: Limited to configured episodes directory
4. **Validation**: All inputs validated before use
5. **Error Messages**: Don't expose sensitive information

## Future Architecture Enhancements

1. **Add TypeScript**: Type safety across all modules
2. **Add Logging**: Replace console.log with proper logger (Winston, Pino)
3. **Add Metrics**: Track upload times, success rates, file sizes
4. **Add Queue**: Use job queue for better concurrency control
5. **Add Cache**: Cache Notion queries to reduce API calls
6. **Add Retry**: Exponential backoff for failed uploads
7. **Add Webhooks**: Notify on upload completion/failure
8. **Add Database**: Track upload history and status

