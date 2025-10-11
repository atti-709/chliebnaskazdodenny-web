/**
 * Notion Block Renderer
 *
 * Renders Notion blocks as React components
 */

import React from 'react'
import type { NotionBlock, NotionTextNode } from './notion.types'

interface NotionBlocksRendererProps {
  content: NotionBlock[]
}

/**
 * Renders a single Notion text node
 */
const NotionTextNode: React.FC<{ node: NotionTextNode }> = ({ node }) => {
  const { text, annotations } = node

  let element = <span>{text.content}</span>

  if (annotations.bold) {
    element = <strong>{element}</strong>
  }

  if (annotations.italic) {
    element = <em>{element}</em>
  }

  if (annotations.strikethrough) {
    element = <del>{element}</del>
  }

  if (annotations.underline) {
    element = <u>{element}</u>
  }

  if (annotations.code) {
    element = <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{element}</code>
  }

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

/**
 * Renders rich text array
 */
const RichText: React.FC<{ richText: NotionTextNode[] }> = ({ richText }) => {
  return (
    <>
      {richText.map((node, index) => (
        <NotionTextNode key={index} node={node} />
      ))}
    </>
  )
}

/**
 * Renders a single Notion block
 */
const NotionBlockComponent: React.FC<{ block: NotionBlock }> = ({ block }) => {
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
          <RichText richText={block.heading_1!.rich_text} />
        </h1>
      )

    case 'heading_2':
      return (
        <h2 className="text-2xl font-bold mb-4 mt-6">
          <RichText richText={block.heading_2!.rich_text} />
        </h2>
      )

    case 'heading_3':
      return (
        <h3 className="text-xl font-bold mb-3 mt-4">
          <RichText richText={block.heading_3!.rich_text} />
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
      console.warn('Unknown block type:', block.type)
      return null
  }
}

/**
 * Main Notion Blocks Renderer component
 */
export const NotionBlocksRenderer: React.FC<NotionBlocksRendererProps> = ({ content }) => {
  const renderBlocks = (blocks: NotionBlock[]) => {
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

  return <div>{renderBlocks(content)}</div>
}
