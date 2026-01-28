import { SectionContent } from './SectionContent';
import { NavigationBar } from './NavigationBar';

export function ExplanationPanel({
  section,
  currentIndex,
  totalSections,
  currentColor,
  showCode,
  onShowCode,
  onPrev,
  onNext
}) {
  return (
    <div className={`${showCode ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/2 flex-col border-b lg:border-b-0 lg:border-r border-slate-300 bg-white`}>
      {/* Header */}
      <div className="border-b border-slate-200 px-4 lg:px-8 py-4 lg:py-6">
        <h1 className="text-xl lg:text-2xl font-light">Building GPT from Scratch</h1>
      </div>

      <SectionContent
        section={section}
        currentColor={currentColor}
        onShowCode={onShowCode}
      />

      <NavigationBar
        currentIndex={currentIndex}
        totalSections={totalSections}
        title={section.title}
        onPrev={onPrev}
        onNext={onNext}
      />
    </div>
  );
}
