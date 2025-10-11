# Rich Text Formatting in JSON

## How Markdown Appears in JSON

Your devotional content can include formatting using Markdown syntax within the JSON strings:

### Bold Text
```
**„Dúfajte!"**
```
Appears as: **„Dúfajte!"**

### Italic Text
```
*smelo*
```
Appears as: *smelo*

### Complete Example

In your JSON file:
```json
{
  "content": "Strach spôsobil, že konali v rozpore s Jeho príkazom: **„Dúfajte!"** a Jeho prísľubom: **„Ja som premohol svet\"** (16,33). Učeníci, ktorí neskôr *smelo* hlásali svetu evanjelium."
}
```

## Benefits

1. **Human-readable**: You can read the JSON and see what's formatted
2. **Version control friendly**: Git diffs show clear changes
3. **Easy to convert**: Markdown can be converted to Notion rich text blocks
4. **Standard format**: Markdown is a widely-supported format

## When Uploading to Notion

The Notion upload script (next step) will automatically convert:
- `**text**` → Bold in Notion
- `*text*` → Italic in Notion
- Plain text → Regular text in Notion

See `devotional-sample.json` for a complete example with formatting.

