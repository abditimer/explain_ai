import { useMemo } from 'react';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import 'highlight.js/styles/github-dark-dimmed.css';

hljs.registerLanguage('python', python);

export function CodeBlock({ code }) {
  const highlighted = useMemo(
    () => hljs.highlight(code, { language: 'python' }).value,
    [code]
  );

  return (
    <pre style={{ margin: 0, padding: '1rem', overflowX: 'auto' }}>
      <code
        className="language-python hljs"
        style={{ fontSize: '0.72rem', lineHeight: '1.65', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </pre>
  );
}
