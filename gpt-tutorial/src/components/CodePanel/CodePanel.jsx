import { ChevronUp } from 'lucide-react';
import { codeBlocks } from '../../data/codeBlocks';
import { CodeBlock } from './CodeBlock';

export function CodePanel({
  showCode,
  onBack,
  currentColor,
  highlightId,
  collapsed,
  onToggleCollapse,
  codeRefs
}) {
  return (
    <div className={`${showCode ? 'flex' : 'hidden lg:flex'} w-full lg:w-1/2 flex-col bg-slate-900 overflow-hidden`}>
      {/* Mobile: Back Button */}
      <div className="lg:hidden border-b border-slate-700 px-4 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 active:text-slate-100 transition-colors"
        >
          <ChevronUp size={18} />
          <span className="text-sm">Back to Explanation</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {codeBlocks.map((block) => (
          <CodeBlock
            key={block.id}
            block={block}
            isActive={block.section === highlightId}
            isCollapsed={collapsed[block.id]}
            accentColor={currentColor}
            onToggle={onToggleCollapse}
            forwardedRef={el => { if (block.section) codeRefs.current[block.section] = el; }}
          />
        ))}
      </div>
    </div>
  );
}
