/**
 * Text Annotation Utilities
 */

import React from 'react'
import type { NotionTextNode } from '../../api/notion.types'

/**
 * Applies text annotations (bold, italic, etc.) to an element
 */
export const applyAnnotations = (
  element: React.ReactElement,
  annotations: NotionTextNode['annotations']
): React.ReactElement => {
  let result = element

  if (annotations.bold) {
    result = <strong>{result}</strong>
  }

  if (annotations.italic) {
    result = <em>{result}</em>
  }

  if (annotations.strikethrough) {
    result = <del>{result}</del>
  }

  if (annotations.underline) {
    result = <u>{result}</u>
  }

  if (annotations.code) {
    result = <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{result}</code>
  }

  return result
}
