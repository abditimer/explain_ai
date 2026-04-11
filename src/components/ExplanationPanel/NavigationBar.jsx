import { ChevronUp, ChevronDown } from 'lucide-react';

export function NavigationBar({ currentIndex, totalSections, title, onPrev, onNext }) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSections - 1;

  return (
    <div className="border-t border-slate-200 p-4 lg:p-6 flex items-center justify-between">
      <button
        onClick={onPrev}
        disabled={isFirst}
        className={`flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2 min-h-[44px] lg:min-h-0 rounded-lg transition ${
          isFirst
            ? 'text-slate-300 cursor-not-allowed'
            : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
        }`}
      >
        <ChevronUp size={18} className="lg:hidden" />
        <ChevronUp size={20} className="hidden lg:block" />
        <span className="text-sm lg:text-base">Prev</span>
      </button>

      <div className="text-center">
        <div className="text-xs lg:text-sm text-slate-500 mb-1">
          {currentIndex + 1} / {totalSections}
        </div>
        <div className="text-sm lg:text-base font-medium text-slate-900">
          {title}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={isLast}
        className={`flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2 min-h-[44px] lg:min-h-0 rounded-lg transition ${
          isLast
            ? 'text-slate-300 cursor-not-allowed'
            : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
        }`}
      >
        <span className="text-sm lg:text-base">Next</span>
        <ChevronDown size={18} className="lg:hidden" />
        <ChevronDown size={20} className="hidden lg:block" />
      </button>
    </div>
  );
}
