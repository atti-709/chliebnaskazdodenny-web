# Podbean Setup Checklist

## Step 1: Get Podbean API Credentials

1. Go to [Podbean Developers Portal](https://developers.podbean.com/)
2. Sign in with your Podbean account
3. Click on "My Apps" or "Create New App"
4. Fill in the application details:
   - **App Name**: Chlieb náš každodenný Uploader
   - **Description**: Automated episode uploader
   - **Redirect URI**: (not needed for client credentials flow)
5. Copy your **Client ID** and **Client Secret**

## Step 2: Add Credentials to .env.local

Add the following lines to your `.env.local` file:

```env
# Podbean API Credentials
PODBEAN_CLIENT_ID=your_client_id_here
PODBEAN_CLIENT_SECRET=your_client_secret_here
```

Your `.env.local` file should now look like this:

```env
# Notion API Credentials
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Podbean API Credentials
PODBEAN_CLIENT_ID=your_client_id_here
PODBEAN_CLIENT_SECRET=your_client_secret_here
```

## Step 3: Test the Script

Run a dry run to test the script without actually uploading:

```bash
npm run podbean:dry-run
```

Or test with a specific date range:

```bash
node scripts/upload-to-podbean.mjs --dry-run --start-date 2026-01-01 --end-date 2026-01-03
```

## Step 4: Upload Your First Episode

Once the dry run looks good, upload your first episode:

```bash
node scripts/upload-to-podbean.mjs --start-date 2026-01-01 --end-date 2026-01-01
```

## Step 5: Upload All Episodes

To upload all episodes at once:

```bash
npm run podbean:upload
```

Or to skip episodes that are already uploaded:

```bash
npm run podbean:upload-skip
```

## Troubleshooting

### Issue: "PODBEAN_CLIENT_ID and PODBEAN_CLIENT_SECRET must be set"

**Solution**: Make sure you've added the credentials to `.env.local` and they're not wrapped in quotes.

### Issue: "Authentication Failed"

**Solution**: 
- Verify your credentials are correct
- Check that your Podbean app is active
- Try regenerating the client secret

### Issue: "No episode title found in Notion"

**Solution**: 
- Verify the episode exists in Notion for that date
- Check the Date property in Notion matches the format YYYY-MM-DD
- Make sure your NOTION_API_KEY and NOTION_DATABASE_ID are correct

## Next Steps

Once everything is working:

1. Set up a cron job or scheduled task to run the upload script automatically
2. See [PODBEAN_UPLOAD_GUIDE.md](./PODBEAN_UPLOAD_GUIDE.md) for detailed usage instructions
3. Consider setting up notifications for upload success/failure

## Support

For more detailed information, see:
- [PODBEAN_UPLOAD_GUIDE.md](./PODBEAN_UPLOAD_GUIDE.md) - Complete usage guide
- [Podbean API Documentation](https://developers.podbean.com/podbean-api-docs/)

