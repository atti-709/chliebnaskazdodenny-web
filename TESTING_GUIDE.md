# Testing Guide - Notion Integration

## Quick Start

### 1. Verify Environment Variables

Check that your `.env.local` file has the correct values:

```bash
cat .env.local
```

You should see:

```
VITE_NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Start the Development Server

```bash
npm run dev
```

The server should start on `http://localhost:5173`

### 3. Test in Browser

Open your browser to `http://localhost:5173` and:

1. Check the console for any errors
2. Verify a devotional loads for today's date
3. Try navigating to previous days
4. Test the date picker

## Common Issues & Solutions

### Issue: "Notion API error: notion.databases.query is not a function"

**Cause**: The Notion SDK was being used directly in the browser, which doesn't work.

**Solution**: ✅ Fixed! Now using serverless architecture:

- Frontend calls `/api/devotionals`
- Vite plugin (local) or serverless function (prod) handles Notion API calls

### Issue: "SyntaxError: Unexpected token '/'"

**Cause**: The API file was using ES6 `import` instead of CommonJS `require`.

**Solution**: ✅ Fixed! Changed to CommonJS format:

```javascript
const { Client } = require('@notionhq/client')
module.exports = async function handler(req, res) { ... }
```

### Issue: 404 errors on API calls

**Possible causes:**

1. Vite dev server not routing `/api/*` correctly
2. Environment variables not loaded

**Solutions:**

- Check that `server.js` is being loaded in `vite.config.js`
- Verify `.env.local` exists and has correct values
- Restart the dev server

### Issue: Empty devotional or null response

**Possible causes:**

1. No devotional exists for the selected date in Notion
2. Database property names don't match expected names
3. Database not shared with integration

**Solutions:**

1. Check your Notion database has entries for today's date
2. Verify property names (case-sensitive):
   - `Title` or `title`
   - `Date` or `date`
   - `Quote` or `quote`
   - `Spotify Embed URI` or `spotifyEmbedUri`
3. Ensure database is shared with your Notion integration

## Testing Checklist

- [ ] Environment variables are set correctly
- [ ] Dev server starts without errors
- [ ] Browser console shows no errors
- [ ] Today's devotional loads
- [ ] Can navigate to previous days
- [ ] Date picker works
- [ ] Spotify embed displays and plays
- [ ] Rich text formatting renders correctly
- [ ] Notion blocks (headings, lists, quotes) render properly

## API Endpoints

Your frontend calls these endpoints:

### Get Devotional by Date

```
GET /api/devotionals?action=getByDate&date=2025-10-11
```

### Get All Devotionals

```
GET /api/devotionals?action=getAll&limit=100
```

### Get Available Dates

```
GET /api/devotionals?action=getDates
```

## Debugging Tips

### Enable Verbose Logging

In `server.js`, add console logs:

```javascript
console.log('Notion API request:', { action, date, limit })
console.log('Notion response:', response)
```

### Check Notion API Directly

Test your Notion setup with a simple script:

```javascript
const { Client } = require('@notionhq/client')

const notion = new Client({ auth: 'your_key_here' })

notion.databases
  .query({
    database_id: 'your_db_id_here',
  })
  .then(response => console.log('Success!', response.results.length, 'pages'))
  .catch(error => console.error('Error:', error))
```

### Network Tab

Open browser DevTools → Network tab:

1. Filter by "Fetch/XHR"
2. Look for calls to `/api/devotionals`
3. Check the response status and data

## Next Steps After Testing

Once everything works locally:

1. **Commit your changes**:

   ```bash
   git add .
   git commit -m "Migrated from Strapi to Notion"
   git push
   ```

2. **Deploy to Vercel or Netlify**:
   - Add environment variables in project settings
   - Deploy!

3. **Test production**:
   - Verify devotionals load on production URL
   - Check that API calls work
   - Test on mobile devices

## Need Help?

1. Check [NOTION_SETUP.md](./NOTION_SETUP.md) for setup instructions
2. Review [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md) for architecture overview
3. Verify your Notion database schema matches requirements
4. Check Notion integration has access to the database
