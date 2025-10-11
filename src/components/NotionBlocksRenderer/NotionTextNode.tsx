/**
 * Notion Text Node Component
 */

import React from 'react'
import type { NotionTextNode } from '../../api/notion.types'
import { applyAnnotations } from './annotations'

interface NotionTextNodeProps {
  node: NotionTextNode
}

/**
 * Renders a single Notion text node
 */
export const NotionTextNodeComponent: React.FC<NotionTextNodeProps> = ({ node }) => {
  const { text, annotations } = node

  let element = <span>{text.content}</span>

  // Apply text annotations
  element = applyAnnotations(element, annotations)

  // Apply link if present
  if (text.link?.url) {
    element = (
      <a
        href={text.link.url}
        className="text-blue-600 hover:text-blue-800 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {element}
      </a>
    )
  }

  return element
}
