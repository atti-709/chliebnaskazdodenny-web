/**
 * Block grouping utilities
 */

import React from 'react'
import type { NotionBlock } from '../../api/notion.types'
import { NotionBlockComponent } from './NotionBlockComponent'

/**
 * Groups consecutive list items into proper list elements
 */
export const groupBlocks = (blocks: NotionBlock[]): React.ReactNode[] => {
  const elements: React.ReactNode[] = []
  let currentList: NotionBlock[] = []
  let listType: 'bulleted' | 'numbered' | null = null

  const flushList = () => {
    if (currentList.length > 0) {
      const ListComponent = listType === 'numbered' ? 'ol' : 'ul'
      elements.push(
        <ListComponent key={`list-${elements.length}`} className="mb-4 pl-6">
          {currentList.map((item, index) => (
            <NotionBlockComponent key={index} block={item} />
          ))}
        </ListComponent>
      )
      currentList = []
      listType = null
    }
  }

  blocks.forEach((block, index) => {
    if (block.type === 'bulleted_list_item') {
      if (listType !== 'bulleted') {
        flushList()
        listType = 'bulleted'
      }
      currentList.push(block)
    } else if (block.type === 'numbered_list_item') {
      if (listType !== 'numbered') {
        flushList()
        listType = 'numbered'
      }
      currentList.push(block)
    } else {
      flushList()
      elements.push(<NotionBlockComponent key={index} block={block} />)
    }
  })

  flushList()
  return elements
}
