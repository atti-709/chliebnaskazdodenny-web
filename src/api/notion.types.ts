/**
 * TypeScript types for Notion API responses
 * Based on Notion API structure for devotional content
 */

// Notion block types for rich text content
export interface NotionTextNode {
  type: 'text'
  text: {
    content: string
    link?: {
      url: string
    } | null
  }
  annotations: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: string
  }
  plain_text: string
  href?: string | null
}

export interface NotionParagraph {
  type: 'paragraph'
  paragraph: {
    rich_text: NotionTextNode[]
    color?: string
  }
}

export interface NotionHeading {
  type: 'heading_1' | 'heading_2' | 'heading_3'
  heading_1?: {
    rich_text: NotionTextNode[]
    color?: string
  }
  heading_2?: {
    rich_text: NotionTextNode[]
    color?: string
  }
  heading_3?: {
    rich_text: NotionTextNode[]
    color?: string
  }
}

export interface NotionBulletedListItem {
  type: 'bulleted_list_item'
  bulleted_list_item: {
    rich_text: NotionTextNode[]
    color?: string
  }
}

export interface NotionNumberedListItem {
  type: 'numbered_list_item'
  numbered_list_item: {
    rich_text: NotionTextNode[]
    color?: string
  }
}

export interface NotionQuote {
  type: 'quote'
  quote: {
    rich_text: NotionTextNode[]
    color?: string
  }
}

export interface NotionCode {
  type: 'code'
  code: {
    rich_text: NotionTextNode[]
    language: string
    caption?: NotionTextNode[]
  }
}

export type NotionBlock =
  | NotionParagraph
  | NotionHeading
  | NotionBulletedListItem
  | NotionNumberedListItem
  | NotionQuote
  | NotionCode

// Notion page properties
export interface NotionPageProperties {
  title: {
    title: NotionTextNode[]
  }
  date: {
    date: {
      start: string
      end?: string | null
      time_zone?: string | null
    } | null
  }
  Quote: {
    rich_text: NotionTextNode[]
  }
  Questions: {
    rich_text: NotionTextNode[]
  }
  VerseDay: {
    rich_text: NotionTextNode[]
  }
  Prayer: {
    rich_text: NotionTextNode[]
  }
  VerseEvening: {
    rich_text: NotionTextNode[]
  }
  'Spotify Embed URI': {
    url: string | null
  }
}

// Notion page structure
export interface NotionPage {
  id: string
  created_time: string
  last_edited_time: string
  properties: NotionPageProperties
  url: string
  archived: boolean
}

// Notion API response structure
export interface NotionQueryResponse {
  object: 'list'
  results: NotionPage[]
  next_cursor: string | null
  has_more: boolean
  type: 'page_or_database'
  page_or_database: Record<string, unknown>
}

// Devotional data structure returned from API
export interface Devotional {
  id: string
  title: string
  date: string // ISO date format: YYYY-MM-DD
  quote: string
  text: NotionBlock[]
  spotifyEmbedUri: string
  questions: string
  verseDay: string
  prayer: string
  verseEvening: string
  createdAt: string
  updatedAt: string
  url: string
}
