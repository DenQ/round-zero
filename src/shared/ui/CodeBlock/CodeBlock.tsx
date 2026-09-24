import { useTheme } from '@mui/material/styles'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark'
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light'

SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('jsx', jsx)
SyntaxHighlighter.registerLanguage('tsx', tsx)
SyntaxHighlighter.registerLanguage('go', go)
SyntaxHighlighter.registerLanguage('sql', sql)

const LANGUAGE_BY_ALIAS: Record<string, string> = {
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  jsx: 'jsx',
  tsx: 'tsx',
  go: 'go',
  golang: 'go',
  sql: 'sql',
}

type CodeBlockProps = {
  code: string
  language?: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const theme = useTheme()

  return (
    <SyntaxHighlighter
      language={resolveLanguage(language)}
      style={theme.palette.mode === 'dark' ? oneDark : oneLight}
      customStyle={{
        margin: 0,
        borderRadius: 8,
        fontSize: '0.875rem',
      }}
      wrapLongLines
    >
      {code}
    </SyntaxHighlighter>
  )
}

function resolveLanguage(language?: string): string {
  if (!language) {
    return 'javascript'
  }

  return LANGUAGE_BY_ALIAS[language.toLowerCase()] ?? language.toLowerCase()
}
