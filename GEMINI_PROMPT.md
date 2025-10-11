# Gemini Parsing Prompt

## How to Export from Google Docs

1. Open your Google Doc with the devotionals
2. Go to **File** → **Download** → **Web Page (.html, zipped)**
3. Extract the ZIP file
4. Find the `.html` file inside and use that file with this prompt

---

Copy and paste this prompt into Gemini, then attach the HTML file:

---

Parse this Slovak devotional HTML file into a JSON array. The HTML preserves rich text formatting from Google Docs. Each devotional entry has the following structure:

1. **Date line** (e.g., "Štvrtok 1. januára 2026")
2. **Two Bible references** separated by spaces (e.g., "Jn 16,31-33        Ž 121")
   - First reference = verseDay
   - Second reference = verseEvening
3. **Title** (one or more lines before the quote, may have formatting)
4. **Quote** - The full inspirational quote with Bible reference in parentheses at the end (e.g., "... Na svete máte súženie, ale dúfajte, ja som premohol svet!" (Jn 16,33))
5. **Main content** (multiple paragraphs of devotional text, may contain bold/italic formatting)
6. **Prayer** (usually starts with "Ďakujem Ti," "Drahý Bože," "Milujúci Bože," "Nebeský Otče," "Láskavý Bože," etc.)
7. **Questions section** starting with "Na zamyslenie:"

**Note on formatting:** The HTML contains rich text formatting (bold, italic, etc.). **Preserve this formatting** in the JSON by converting HTML tags to Markdown:
- `<b>` or `<strong>` → `**text**` (bold)
- `<i>` or `<em>` → `*text*` (italic)
- Keep paragraph breaks as `\n\n`

Parse ALL devotionals in the file and return a JSON array with this exact structure for each entry:

```json
{
  "date": "2026-01-01",
  "title": "Title text",
  "quote": "\"... Na svete máte súženie, ale dúfajte, ja som premohol svet!\" (Jn 16,33)",
  "verseDay": "Jn 16,31-33",
  "verseEvening": "Ž 121",
  "content": "Main devotional text (combine all paragraphs with \\n\\n between them)",
  "prayer": "Prayer text",
  "questions": "Questions text"
}
```

**Note:** The quote field should NOT have a trailing period after the closing parenthesis.

**Important rules:**
- Convert Slovak dates to ISO format (YYYY-MM-DD)
  - "Štvrtok 1. januára 2026" → "2026-01-01"
  - "Piatok 2. januára 2026" → "2026-01-02"
  - etc.
- Keep all Slovak text exactly as written
- **Use actual characters, NOT Unicode escape sequences:**
  - Use `…` not `\u2026` for ellipsis
  - Use actual quotation marks `"` not `\u201C` or `\u201D`
  - Use actual characters for all special symbols
- **Title formatting:**
  - The `title` field should be PLAIN TEXT without any Markdown formatting
  - Do NOT use `**bold**` or `*italic*` in titles
- **Quote formatting:**
  - The `quote` field should be PLAIN TEXT without any Markdown formatting
  - Do NOT use `**bold**` or `*italic*` or asterisks in quotes
  - Keep the quote text and Bible reference as plain text
  - Do NOT add a trailing period at the end of the quote
  - Format: `"Quote text here" (Bible Reference)` - note: no period after the closing parenthesis
- **Content formatting:**
  - Preserve formatting in `content`, `prayer`, and `questions` by converting HTML to Markdown:
    - `<b>` or `<strong>` → `**text**`
    - `<i>` or `<em>` → `*text*`
    - Keep quotes in quotation marks "like this"
- Combine content paragraphs with `\n\n` (double newline) between them
- Do NOT include the quote text itself in content, only the main devotional paragraphs
- The **quote** field should contain the FULL quote text including the Bible reference in parentheses WITHOUT a trailing period (e.g., `"... Na svete máte súženie, ale dúfajte, ja som premohol svet!" (Jn 16,33)` - no period at the end)
- Ignore any extra HTML elements like page numbers, headers, footers
- Return ONLY valid JSON, no other text or markdown code blocks
- Make sure to parse ALL entries in the file

**Example output format:**
See the attached `devotional-sample.json` file for the exact format expected.

Return the complete parsed JSON array for all devotionals.

---

## After Getting the Response

1. Copy the JSON response from Gemini
2. Save it as `devotionals-2026-jan.json` in the project root
3. Validate it's proper JSON (you can use an online JSON validator or `node -e "JSON.parse(require('fs').readFileSync('devotionals-2026-jan.json'))"`)
4. Use it with the Notion upload script (next step)

## About Rich Text Formatting

The prompt is configured to preserve formatting by converting HTML to Markdown syntax:
- **Bold text** appears as `**text**` in JSON
- *Italic text* appears as `*text*` in JSON
- Regular text stays as is

This makes the JSON human-readable while preserving all formatting information. When you upload to Notion, you can either:
1. Convert Markdown to Notion's rich text blocks (we'll create a script for this)
2. Paste as plain text and add formatting in Notion manually

