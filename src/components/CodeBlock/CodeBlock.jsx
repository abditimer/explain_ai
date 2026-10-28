import { useMemo } from 'react';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';

hljs.registerLanguage('python', python);

export function CodeBlock({ code, startLine = 1, expressionId, operationId, activeRange }) {
  const highlighted = useMemo(
    () => hljs.highlight(code, { language: 'python' }).value,
    [code]
  );

  const lines = highlighted.split('\n');
  const firstVisible = operationId && activeRange
    ? Math.max(0, activeRange[0] - startLine - 2)
    : 0;
  const lastVisible = operationId && activeRange
    ? Math.min(lines.length - 1, activeRange[1] - startLine + 2)
    : lines.length - 1;
  const visibleLines = Array.from({ length: lastVisible - firstVisible + 1 }, (_, index) => firstVisible + index);
  return (
    <pre className="structured-code">
      <code className="language-python hljs" aria-label="Python source code near the active operation">
        {firstVisible > 0 && <span className="code-line-gap" aria-label={`${firstVisible} preceding lines omitted`}>…</span>}
        {visibleLines.map((index) => {
          const line = lines[index];
          const lineNumber = startLine + index;
          const isRelevant = activeRange && lineNumber >= activeRange[0] && lineNumber <= activeRange[1];
          return (
            <span
              className={`code-line${isRelevant ? ' is-relevant' : ''}`}
              id={isRelevant && operationId ? `${operationId}-line-${lineNumber}` : expressionId ? `${expressionId}-line-${lineNumber}` : undefined}
              data-line-number={lineNumber}
              data-code-expression-id={isRelevant ? operationId ?? expressionId : undefined}
              key={index}
            >
              <span className="code-line-number" aria-hidden="true">{lineNumber}</span>
              <span dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
            </span>
          );
        })}
        {lastVisible < lines.length - 1 && <span className="code-line-gap" aria-label={`${lines.length - lastVisible - 1} following lines omitted`}>…</span>}
      </code>
    </pre>
  );
}
