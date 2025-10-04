/**
 * TypeScript types for Strapi API responses
 * Generated based on actual API response structure
 */

// Strapi block types for rich text content
export interface BlockTextNode {
  type: 'text'
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
}

export interface BlockParagraph {
  type: 'paragraph'
  children: BlockTextNode[]
}

export interface BlockHeading {
  type: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: BlockTextNode[]
}

export interface BlockList {
  type: 'list'
  format: 'ordered' | 'unordered'
  children: BlockListItem[]
}

export interface BlockListItem {
  type: 'list-item'
  children: BlockTextNode[]
}

export interface BlockQuote {
  type: 'quote'
  children: BlockTextNode[]
}

export interface BlockCode {
  type: 'code'
  children: BlockTextNode[]
}

export type BlockNode =
  | BlockParagraph
  | BlockHeading
  | BlockList
  | BlockListItem
  | BlockQuote
  | BlockCode

export type RichTextBlocks = BlockNode[]

// Devotional data structure
export interface Devotional {
  id: number
  documentId: string
  title: string
  date: string // ISO date format: YYYY-MM-DD
  scripture: string
  text: RichTextBlocks
  spotifyEmbedUri: string
  createdAt: string
  updatedAt: string
  publishedAt: string
}

// Strapi API response structures
export interface StrapiPagination {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

export interface StrapiMeta {
  pagination: StrapiPagination
}

export interface StrapiResponse<T> {
  data: T
  meta: StrapiMeta
}

export interface StrapiError {
  data: null
  error: {
    status: number
    name: string
    message: string
    details: Record<string, unknown>
  }
}

// API response types
export type DevotionalsResponse = StrapiResponse<Devotional[]>
export type DevotionalResponse = StrapiResponse<Devotional | null>

// Client function return types
export interface DevotionalData {
  id: number
  date: string
  title: string
  scripture: string
  text: RichTextBlocks
  spotifyEmbedUri: string
}
