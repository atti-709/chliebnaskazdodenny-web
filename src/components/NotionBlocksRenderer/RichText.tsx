/**
 * Rich Text Renderer
 */

import React from 'react'
import type { NotionTextNode } from '../../api/notion.types'
import { NotionTextNodeComponent } from './NotionTextNode'

interface RichTextProps {
  richText: NotionTextNode[]
}

/**
 * Renders rich text array
 */
export const RichText: React.FC<RichTextProps> = ({ richText }) => {
  return (
    <>
      {richText.map((node, index) => (
        <NotionTextNodeComponent key={index} node={node} />
      ))}
    </>
  )
}
