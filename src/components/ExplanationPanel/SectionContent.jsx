export function SectionContent({ section, currentColor, onShowCode }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className={`h-1 w-16 lg:w-20 ${currentColor.replace('border-', 'bg-')} rounded mb-4 lg:mb-6`}></div>

      <h2 className="text-2xl lg:text-3xl font-light mb-4 lg:mb-6">{section.title}</h2>

      <p className="text-slate-700 text-base lg:text-lg leading-relaxed mb-4 lg:mb-6 whitespace-pre-line">
        {section.content}
      </p>

      {section.visual && (
        <div className="bg-slate-50 rounded-lg p-4 lg:p-6 border border-slate-200 overflow-x-auto">
          <pre className="text-xs lg:text-sm font-mono text-slate-800 whitespace-pre">
            {section.visual}
          </pre>
        </div>
      )}

      {/* Mobile: Show Code Button */}
      <button
        onClick={onShowCode}
        className="lg:hidden mt-6 w-full py-3 bg-slate-900 text-white rounded-lg font-medium active:bg-slate-800 transition-colors"
      >
        View Code →
      </button>
    </div>
  );
}
