# How to Find the Correct RSS.com API Endpoint

## Current Issue

We're getting a 404 error: `Cannot POST /v4/channels/362667/items`

This means the endpoint doesn't exist or we're using the wrong method.

## Steps to Find the Correct Endpoint

### 1. Check the API Documentation

Go to [https://api.rss.com/v4/docs](https://api.rss.com/v4/docs) and look for:

- **"Create Episode"** or **"Create Item"** section
- **"Upload Media"** or **"Upload Enclosure"** section
- The exact HTTP method (POST, PUT, etc.)
- The exact endpoint path
- Required headers and body format

### 2. Check Your RSS.com Dashboard

1. Log in to RSS.com
2. Go to your podcast dashboard
3. Look for:
   - Your **Channel ID** or **Podcast ID** (you're using: 362667)
   - API documentation link
   - Any API examples in settings

### 3. Test with curl

Try testing the API directly with curl to see what works:

```bash
# Test 1: Check if channel exists
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.rss.com/v4/channels/362667

# Test 2: List items (if endpoint exists)
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.rss.com/v4/channels/362667/items

# Test 3: Try creating an item with minimal data
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Episode","description":"Test"}' \
  https://api.rss.com/v4/channels/362667/items
```

### 4. Common RSS.com API Patterns

Based on typical podcast hosting APIs, try these patterns:

**Pattern A: Standard REST**
```
POST /v4/channels/{channelId}/items
POST /v4/channels/{channelId}/episodes
```

**Pattern B: Nested Resource**
```
POST /v4/items (with channelId in body)
POST /v4/episodes (with channelId in body)
```

**Pattern C: Two-Step Upload**
```
1. POST /v4/channels/{channelId}/items (create metadata)
2. POST /v4/items/{itemId}/media (upload file)
```

### 5. Contact RSS.com Support

If the API documentation isn't clear:

1. Email: support@rss.com
2. Include:
   - Your account plan (Network plan)
   - Request for API upload documentation
   - Mention you're getting 404 on item creation

### 6. Alternative: Use Web Interface

Until the API endpoint is resolved, you can:

1. Upload files manually via RSS.com dashboard
2. Use the script for metadata management only
3. Best of both worlds approach

## What to Look For in API Docs

When you check the documentation, please find:

1. **Endpoint URL**: The exact path for creating items/episodes
2. **HTTP Method**: POST, PUT, etc.
3. **Content-Type**: multipart/form-data, application/json, etc.
4. **Field Names**: What to call the audio file field (enclosure, media, audio, file, etc.)
5. **Required Fields**: What fields are mandatory
6. **File Size Limits**: Maximum file size allowed
7. **Authentication**: How to pass the API key (header format)

## Example from Documentation

Please share a screenshot or copy-paste from the docs showing:
```
POST /v4/channels/{channelId}/??? 
Headers:
  Authorization: Bearer {token}
Body:
  title: string
  ???: file
```

Once we have this information, we can update the script correctly!

