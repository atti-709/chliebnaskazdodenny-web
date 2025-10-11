/**
 * Individual Notion Block Component
 */

import React from 'react'
import type { NotionBlock } from '../../api/notion.types'
import { RichText } from './RichText'

interface NotionBlockComponentProps {
  block: NotionBlock
}

/**
 * Renders a single Notion block
 */
export const NotionBlockComponent: React.FC<NotionBlockComponentProps> = ({ block }) => {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="mb-4">
          <RichText richText={block.paragraph.rich_text} />
        </p>
      )

    case 'heading_1':
      return (
        <h1 className="text-3xl font-bold mb-6 mt-8">
          <RichText richText={block.heading_1?.rich_text || []} />
        </h1>
      )

    case 'heading_2':
      return (
        <h2 className="text-2xl font-bold mb-4 mt-6">
          <RichText richText={block.heading_2?.rich_text || []} />
        </h2>
      )

    case 'heading_3':
      return (
        <h3 className="text-xl font-bold mb-3 mt-4">
          <RichText richText={block.heading_3?.rich_text || []} />
        </h3>
      )

    case 'bulleted_list_item':
      return (
        <li className="mb-2">
          <RichText richText={block.bulleted_list_item.rich_text} />
        </li>
      )

    case 'numbered_list_item':
      return (
        <li className="mb-2">
          <RichText richText={block.numbered_list_item.rich_text} />
        </li>
      )

    case 'quote':
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
          <RichText richText={block.quote.rich_text} />
        </blockquote>
      )

    case 'code':
      return (
        <div className="my-4">
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm font-mono">
              <RichText richText={block.code.rich_text} />
            </code>
          </pre>
          {block.code.caption && block.code.caption.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              <RichText richText={block.code.caption} />
            </p>
          )}
        </div>
      )

    default:
      console.warn('Unknown block type:', (block as NotionBlock).type)
      return null
  }
}
