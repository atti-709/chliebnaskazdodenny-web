Parse this Slovak devotional HTML file into a JSON array. The HTML preserves rich text formatting from Google Docs. Each devotional entry has the following structure:

1. **Date line** (e.g., "Štvrtok 1. januára 2026")
2. **Two Bible references** separated by spaces (e.g., "Jn 16,31-33        Ž 121")
   - First reference = verseDay
   - Second reference = verseEvening
3. **Optional holiday line** (e.g., "Nový rok", "adventná nedeľa") - if present, this appears above the title and should be EXCLUDED from the title
4. **Title** (one or more lines before the quote, may have formatting)
5. **Quote** - The full inspirational quote with Bible reference in parentheses at the end (e.g., "... Na svete máte súženie, ale dúfajte, ja som premohol svet!" (Jn 16,33))
6. **Main content** (multiple paragraphs of devotional text, may contain bold/italic formatting)
7. **Prayer** (usually starts with "Ďakujem Ti," "Drahý Bože," "Milujúci Bože," "Nebeský Otče," "Láskavý Bože," etc.)
8. **Questions section** starting with "Na zamyslenie:"

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
- **Handle hyphenated words:** Since the text is from a printed publication, some words are divided at the end of lines with hyphens. Join these word parts together and remove the hyphens to form complete words.
  - Example: "pre-\nmohol" should become "premohol"
- **Exclude holiday names:** If a holiday name (e.g., "Nový rok", "adventná nedeľa", etc.) appears on a separate line above the title, do NOT include it in the title field
- Keep all Slovak text exactly as written
- **Use actual characters, NOT Unicode escape sequences or HTML entities:**
  - Use `…` not `\u2026` or `&hellip;` for ellipsis
  - Use actual quotation marks `"` not `\u201C` or `&ldquo;` or `&rdquo;`
  - Use actual Slovak characters: `á é í ó ú ý ä ô ň č š ž ľ ť ď ŕ` 
  - **NEVER use HTML entities** like `&aacute;` `&iacute;` `&eacute;` etc.
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
- **Prayer formatting:**
  - The `prayer` field should be PLAIN TEXT without any Markdown formatting
  - Do NOT use `**bold**` or `*italic*` or asterisks in prayer
  - Keep the prayer text as plain text
- **Content formatting:**
  - Preserve formatting in `content` and `questions` by converting HTML to Markdown:
    - `<b>` or `<strong>` → `**text**`
    - `<i>` or `<em>` → `*text*`
  - **IMPORTANT: Use smart quotes for quotations in text**:
    - Use Slovak smart quotes: „ (opening) and " (closing) for quotations within text
    - Example: „Dúfajte!" instead of "Dúfajte!"
    - This prevents JSON parsing errors when quotes appear before markdown formatting
- Combine content paragraphs with `\n\n` (double newline) between them
- Do NOT include the quote text itself in content, only the main devotional paragraphs
- The **quote** field should contain the FULL quote text including the Bible reference in parentheses WITHOUT a trailing period (e.g., `"... Na svete máte súženie, ale dúfajte, ja som premohol svet!" (Jn 16,33)` - no period at the end)
- Ignore any extra HTML elements like page numbers, headers, footers
- Return ONLY valid JSON, no other text or markdown code blocks
- Make sure to parse ALL entries in the file

**Example output - return a JSON array like this:**

```json
[
  {
    "date": "2026-01-01",
    "title": "Title text",
    "quote": "\"Quote text here\" (Jn 16,33)",
    "verseDay": "Jn 16,31-33",
    "verseEvening": "Ž 121",
    "content": "First paragraph.\n\nSecond paragraph with **bold** and *italic* text.",
    "prayer": "Prayer text here",
    "questions": "Question 1\nQuestion 2"
  }
]
```

Return the complete parsed JSON array for all devotionals.