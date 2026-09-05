type Node = { type?: string; text?: string; tag?: string; children?: Node[]; listType?: string; format?: number }

/**
 * Minimal Lexical renderer. Payload's rich text is a node tree, not HTML, so
 * it has to be walked. Deliberately small: it covers what editors can actually
 * produce with the toolbar as configured, and ignores anything it does not
 * recognise rather than crashing a page on an unexpected node type.
 */
const renderNodes = (nodes: Node[] | undefined, keyPrefix = ''): React.ReactNode => {
  if (!Array.isArray(nodes)) return null
  return nodes.map((node, i) => {
    const key = `${keyPrefix}${i}`
    if (node.type === 'text') {
      let el: React.ReactNode = node.text ?? ''
      const f = node.format ?? 0
      if (f & 1) el = <strong key={key}>{el}</strong>
      if (f & 2) el = <em key={key}>{el}</em>
      if (f & 8) el = <u key={key}>{el}</u>
      return <span key={key}>{el}</span>
    }
    const kids = renderNodes(node.children, `${key}-`)
    switch (node.type) {
      case 'heading': {
        const Tag = (node.tag ?? 'h3') as 'h2' | 'h3' | 'h4'
        return <Tag key={key}>{kids}</Tag>
      }
      case 'list':
        return node.listType === 'number' ? <ol key={key}>{kids}</ol> : <ul key={key}>{kids}</ul>
      case 'listitem':
        return <li key={key}>{kids}</li>
      case 'quote':
        return <blockquote key={key}>{kids}</blockquote>
      case 'paragraph':
        return <p key={key}>{kids}</p>
      default:
        return kids ? <div key={key}>{kids}</div> : null
    }
  })
}

export const RichText = ({ value }: { value: unknown }) => {
  const root = (value as { root?: Node } | null)?.root
  if (!root) return null
  return <>{renderNodes(root.children)}</>
}
