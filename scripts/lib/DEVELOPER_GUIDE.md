# Developer Guide - Upload Scripts Library

## Quick Start

### Using the Modules

```javascript
// Import what you need
import { rssConfig } from './lib/config.js'
import { testCredentials, getExistingEpisodes } from './lib/rss-api.js'
import { getEpisodeFromNotion } from './lib/notion-api.js'

// Use the functions
await testCredentials()
const episodes = await getExistingEpisodes()
const episode = await getEpisodeFromNotion('2024-01-01')
```

### Creating a New Script

```javascript
#!/usr/bin/env node
import { validateAllConfig } from './lib/config.js'
import { getExistingEpisodes } from './lib/rss-api.js'

async function main() {
  // Validate configuration first
  validateAllConfig()
  
  // Use the modules
  const episodes = await getExistingEpisodes()
  console.log(`Found ${episodes.length} episodes`)
}

main().catch(console.error)
```

## Common Tasks

### 1. Fetch Episode from Notion

```javascript
import { getEpisodeFromNotion } from './lib/notion-api.js'

const episode = await getEpisodeFromNotion('2024-01-15')
if (episode) {
  console.log(`Title: ${episode.title}`)
  console.log(`Page ID: ${episode.pageId}`)
}
```

### 2. Check for Duplicate Episodes

```javascript
import { getExistingEpisodes, findExistingEpisode } from './lib/rss-api.js'

const existing = await getExistingEpisodes()
const duplicate = findExistingEpisode(existing, 'Episode Title', '2024-01-15')

if (duplicate) {
  console.log('Episode already exists!')
}
```

### 3. Convert Audio File

```javascript
import { checkFFmpeg, convertWAVtoMP3 } from './lib/audio-converter.js'

if (await checkFFmpeg()) {
  await convertWAVtoMP3('/path/to/input.wav', '/path/to/output.mp3')
  console.log('Conversion complete!')
}
```

### 4. Scan Episodes Directory

```javascript
import { scanEpisodesDirectory } from './lib/episode-scanner.js'

const episodes = await scanEpisodesDirectory({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
})

episodes.forEach(ep => {
  console.log(`${ep.date}: ${ep.audioFile} (${ep.fileSizeMB} MB)`)
})
```

### 5. Upload Single Episode

```javascript
import { uploadEpisode } from './lib/episode-uploader.js'

const episode = {
  date: '2024-01-15',
  folderName: '20240115_episode_name',
  audioFile: 'episode.mp3',
  audioFilePath: '/path/to/episode.mp3',
  fileSize: 10485760,
  fileSizeMB: '10.00',
  needsConversion: false
}

const result = await uploadEpisode(episode, {
  dryRun: false,
  force: false
})

if (result.success) {
  console.log('Upload successful!')
}
```

## Module APIs

### config.js

```javascript
// Validate all configuration
import { validateAllConfig } from './lib/config.js'
validateAllConfig() // Throws if invalid

// Access configuration
import { rssConfig, notionConfig, episodesConfig } from './lib/config.js'
console.log(rssConfig.apiKey)
console.log(notionConfig.databaseId)
console.log(episodesConfig.path)
```

### rss-api.js

```javascript
import {
  testCredentials,
  getExistingEpisodes,
  findExistingEpisode,
  getPresignedUploadUrl,
  uploadToPresignedUrl,
  createEpisodeWithAsset
} from './lib/rss-api.js'

// Test credentials
const valid = await testCredentials() // Returns boolean

// Get existing episodes
const episodes = await getExistingEpisodes(100) // limit optional

// Find duplicate
const duplicate = findExistingEpisode(episodes, 'Title', '2024-01-01')

// Upload process (usually use uploadAndCreateEpisode instead)
const presigned = await getPresignedUploadUrl('file.mp3', 10485760)
await uploadToPresignedUrl(fileBuffer, presigned.uploadUrl)
const episode = await createEpisodeWithAsset(presigned.assetId, 'Title', '2024-01-01')
```

### notion-api.js

```javascript
import {
  getEpisodeFromNotion,
  updateNotionEmbedUri
} from './lib/notion-api.js'

// Get episode by date
const episode = await getEpisodeFromNotion('2024-01-01')
// Returns: { pageId: string, title: string } | null

// Update embed URI
const success = await updateNotionEmbedUri(pageId, 'https://...')
// Returns: boolean
```

### audio-converter.js

```javascript
import {
  checkFFmpeg,
  convertWAVtoMP3
} from './lib/audio-converter.js'

// Check if ffmpeg is available
const hasFFmpeg = await checkFFmpeg() // Returns boolean

// Convert WAV to MP3
await convertWAVtoMP3('/path/to/input.wav', '/path/to/output.mp3')
// Throws on error
```

### episode-scanner.js

```javascript
import {
  extractDateFromFolderName,
  scanEpisodesDirectory
} from './lib/episode-scanner.js'

// Extract date from folder name
const date = extractDateFromFolderName('20240115_episode')
// Returns: '2024-01-15' | null

// Scan episodes directory
const episodes = await scanEpisodesDirectory({
  startDate: '2024-01-01', // optional
  endDate: '2024-01-31'    // optional
})
// Returns: Episode[]
```

### episode-uploader.js

```javascript
import {
  uploadAndCreateEpisode,
  uploadEpisode
} from './lib/episode-uploader.js'

// Upload audio and create episode (low-level)
const result = await uploadAndCreateEpisode(
  '/path/to/audio.mp3',
  'Episode Title',
  '2024-01-01'
)
// Returns: { episodeId, playerUrl, permalink }

// Upload episode with all checks (high-level)
const result = await uploadEpisode(episode, {
  dryRun: false,
  force: false,
  existingEpisodes: []
})
// Returns: { success, skipped?, dryRun?, reason?, data?, error? }
```

## Error Handling

### Try-Catch Pattern

```javascript
import { getEpisodeFromNotion } from './lib/notion-api.js'

try {
  const episode = await getEpisodeFromNotion('2024-01-01')
  if (!episode) {
    console.log('Episode not found')
  } else {
    console.log(`Found: ${episode.title}`)
  }
} catch (error) {
  console.error('API error:', error.message)
}
```

### Result Object Pattern

```javascript
import { uploadEpisode } from './lib/episode-uploader.js'

const result = await uploadEpisode(episode, options)

if (result.success) {
  if (result.skipped) {
    console.log(`Skipped: ${result.reason}`)
  } else {
    console.log('Upload successful!')
  }
} else {
  console.error(`Failed: ${result.error}`)
}
```

## Testing

### Unit Testing Example

```javascript
import { extractDateFromFolderName } from './lib/episode-scanner.js'
import assert from 'assert'

// Test date extraction
assert.equal(
  extractDateFromFolderName('20240115_test'),
  '2024-01-15'
)

assert.equal(
  extractDateFromFolderName('invalid'),
  null
)
```

### Mocking Example

```javascript
import * as rssApi from './lib/rss-api.js'

// Mock testCredentials for testing
const originalTestCredentials = rssApi.testCredentials
rssApi.testCredentials = async () => true

// Run your test
await myFunction()

// Restore original
rssApi.testCredentials = originalTestCredentials
```

## Best Practices

### 1. Always Validate Configuration First

```javascript
import { validateAllConfig } from './lib/config.js'

async function main() {
  validateAllConfig() // Do this first!
  // ... rest of your code
}
```

### 2. Handle Null Returns

```javascript
const episode = await getEpisodeFromNotion(date)
if (!episode) {
  console.error('Episode not found')
  return
}
// Now safe to use episode.title
```

### 3. Use Dry Run for Testing

```javascript
const result = await uploadEpisode(episode, {
  dryRun: true // Test without actually uploading
})
```

### 4. Check for Duplicates

```javascript
const existing = await getExistingEpisodes()
const duplicate = findExistingEpisode(existing, title, date)

if (duplicate && !options.force) {
  console.log('Episode already exists')
  return
}
```

### 5. Rate Limit API Calls

```javascript
for (const episode of episodes) {
  await uploadEpisode(episode, options)
  
  // Wait between uploads
  await new Promise(resolve => setTimeout(resolve, 2000))
}
```

## Common Patterns

### Pattern 1: Batch Processing

```javascript
import { scanEpisodesDirectory } from './lib/episode-scanner.js'
import { uploadEpisode } from './lib/episode-uploader.js'

const episodes = await scanEpisodesDirectory()

for (const episode of episodes) {
  const result = await uploadEpisode(episode, options)
  
  if (result.success) {
    console.log(`✅ ${episode.date}`)
  } else {
    console.error(`❌ ${episode.date}: ${result.error}`)
  }
}
```

### Pattern 2: Filtering Episodes

```javascript
import { scanEpisodesDirectory } from './lib/episode-scanner.js'

// Filter by date range
const episodes = await scanEpisodesDirectory({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
})

// Further filter by custom criteria
const mp3Episodes = episodes.filter(ep => !ep.needsConversion)
```

### Pattern 3: Conditional Upload

```javascript
import { getExistingEpisodes, findExistingEpisode } from './lib/rss-api.js'

const existing = await getExistingEpisodes()

for (const episode of episodes) {
  const duplicate = findExistingEpisode(existing, title, episode.date)
  
  if (duplicate) {
    console.log(`Skipping ${episode.date} - already exists`)
    continue
  }
  
  await uploadEpisode(episode, options)
}
```

### Pattern 4: Progress Tracking

```javascript
let completed = 0
const total = episodes.length

for (const episode of episodes) {
  await uploadEpisode(episode, options)
  completed++
  console.log(`Progress: ${completed}/${total} (${Math.round(completed/total*100)}%)`)
}
```

## Debugging Tips

### 1. Enable Verbose Logging

The modules already log important steps. Watch for:
- `🔐 Credentials loaded`
- `📝 Step 1: Requesting presigned upload URL`
- `📤 Step 2: Uploading file to S3`
- `📝 Step 3: Creating episode`

### 2. Use Dry Run Mode

```javascript
const result = await uploadEpisode(episode, { dryRun: true })
// Shows what would happen without actually doing it
```

### 3. Check Environment Variables

```javascript
import { rssConfig, notionConfig } from './lib/config.js'

console.log('RSS API Key:', rssConfig.apiKey ? 'Set' : 'Missing')
console.log('Notion API Key:', notionConfig.apiKey ? 'Set' : 'Missing')
```

### 4. Test API Credentials

```javascript
import { testCredentials } from './lib/rss-api.js'

const valid = await testCredentials()
if (!valid) {
  console.error('Credentials invalid!')
}
```

## Performance Tips

### 1. Limit Episode Fetches

```javascript
// Only fetch what you need
const episodes = await getExistingEpisodes(50) // Instead of 360
```

### 2. Cache Notion Queries

```javascript
const notionCache = new Map()

async function getCachedEpisode(date) {
  if (notionCache.has(date)) {
    return notionCache.get(date)
  }
  
  const episode = await getEpisodeFromNotion(date)
  notionCache.set(date, episode)
  return episode
}
```

### 3. Parallel Processing (Advanced)

```javascript
// Upload multiple episodes in parallel (be careful with rate limits!)
const promises = episodes.map(ep => uploadEpisode(ep, options))
const results = await Promise.allSettled(promises)
```

## Troubleshooting

### Problem: "Missing required environment variables"
**Solution**: Check `.env.local` file exists and contains all required variables

### Problem: "Credential test failed"
**Solution**: Verify API keys are correct and have proper permissions

### Problem: "ffmpeg not found"
**Solution**: Install ffmpeg: `brew install ffmpeg` (macOS) or `apt-get install ffmpeg` (Linux)

### Problem: "No episodes found to upload"
**Solution**: Check episodes directory path and ensure folders have FINAL subfolder with audio files

### Problem: "Episode already exists"
**Solution**: Use `--force` flag to upload anyway, or skip the episode

## Contributing

When adding new features:

1. **Add to appropriate module** - Don't mix concerns
2. **Export public functions** - Keep internal functions private
3. **Document with JSDoc** - Add parameter and return types
4. **Handle errors properly** - Throw or return error objects
5. **Add to this guide** - Document new functionality

## Resources

- [RSS.com API Documentation](https://rss.com/api)
- [Notion API Documentation](https://developers.notion.com)
- [ffmpeg Documentation](https://ffmpeg.org/documentation.html)

