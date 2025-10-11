/**
 * Notion Block Renderer
 *
 * Renders Notion blocks as React components
 */

import React from 'react'
import type { NotionBlock } from '../../api/notion.types'
import { groupBlocks } from './utils'

interface NotionBlocksRendererProps {
  content: NotionBlock[]
}

/**
 * Main Notion Blocks Renderer component
 */
export const NotionBlocksRenderer: React.FC<NotionBlocksRendererProps> = ({ content }) => {
  const elements = groupBlocks(content)
  return <div>{elements}</div>
}
