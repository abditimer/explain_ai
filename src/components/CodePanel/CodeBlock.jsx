import { ChevronRight } from 'lucide-react';

export function CodeBlock({ block, isActive, isCollapsed, accentColor, onToggle, forwardedRef }) {
  return (
    <div
      ref={forwardedRef}
      className={`mb-2 lg:mb-3 rounded-lg border-l-4 transition-all ${
        isActive
          ? `${accentColor} bg-slate-800/50`
          : 'border-transparent'
      }`}
    >
      <button
        onClick={() => onToggle(block.id)}
        className="w-full flex items-center gap-2 px-3 lg:px-4 py-3 lg:py-2 text-left hover:bg-slate-800/30 active:bg-slate-800/50 rounded-t-lg transition-colors"
      >
        <ChevronRight
          size={14}
          className={`lg:hidden text-slate-400 transition-transform ${
            isCollapsed ? '' : 'rotate-90'
          }`}
        />
        <ChevronRight
          size={16}
          className={`hidden lg:block text-slate-400 transition-transform ${
            isCollapsed ? '' : 'rotate-90'
          }`}
        />
        <span className="text-slate-300 font-medium text-xs lg:text-sm">
          {block.title}
        </span>
      </button>

      {!isCollapsed && (
        <pre className="px-3 lg:px-4 pb-2 lg:pb-3 text-slate-100 text-xs lg:text-sm font-mono overflow-x-auto">
          <code>{block.code}</code>
        </pre>
      )}
    </div>
  );
}
