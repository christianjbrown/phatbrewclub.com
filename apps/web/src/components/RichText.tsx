type Node = {
  type?: string
  text?: string
  tag?: string
  children?: Node[]
  listType?: string
  format?: number
  fields?: { url?: string; newTab?: boolean }
}

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
      /**
       * Links and line breaks were missing, and both failed quietly.
       *
       * A link node fell through to the default branch, which renders the
       * children in a div: the words survived and the href did not, so a
       * hyperlink an editor added in the CMS arrived on the site as plain text
       * with no indication anything had been lost. A linebreak returned null
       * and simply vanished. Neither is in any of the seeded content, which is
       * why it went unnoticed — the first person to add a link would have found
       * it instead.
       */
      case 'link':
      case 'autolink': {
        const url = node.fields?.url
        if (!url) return kids
        const external = /^https?:\/\//i.test(url)
        return (
          <a
            key={key}
            href={url}
            {...(node.fields?.newTab || external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          >
            {kids}
          </a>
        )
      }
      case 'linebreak':
        return <br key={key} />
      default:
        return kids ? <div key={key}>{kids}</div> : null
    }
  })
}

/**
 * Renders either a Lexical node tree or a string of HTML.
 *
 * Payload stores a node tree; WordPress stores HTML. Rather than convert one
 * into the other — which would be more code producing less fidelity — this
 * takes both, so every page and block renders identically whichever CMS is
 * behind it. The field types in lib/types.ts already say `unknown`, so nothing
 * else has to change.
 *
 * The HTML branch trusts its input, and that is a deliberate, bounded decision
 * rather than an oversight. The only producer is the WordPress read API, which
 * runs wp_kses over an allow-list of the seven tags this component can render
 * — no class, no style, no id, no script — and the WordPress install sets
 * DISALLOW_UNFILTERED_HTML so nothing dangerous can be stored in the first
 * place. Sanitising a second time here, in TypeScript, would duplicate that
 * allow-list in a second place and guarantee the two drift.
 */
export const RichText = ({ value }: { value: unknown }) => {
  if (typeof value === 'string') {
    return value.trim() ? <div dangerouslySetInnerHTML={{ __html: value }} /> : null
  }

  const root = (value as { root?: Node } | null)?.root
  if (!root) return null
  return <>{renderNodes(root.children)}</>
}
