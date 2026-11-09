import React from 'react';
import {
  TEMPLATE_DEFINITIONS,
  TemplateId,
  AccentColorHex,
} from '../../lib/resume/types';
import { useResumeStore } from '../../lib/resume/store';
import { X, Check } from 'lucide-react';

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Miniature SVG/CSS architectural diagram of each template's genuine layout
 */
const TemplateMiniThumbnail: React.FC<{
  id: TemplateId;
  accentColor: AccentColorHex;
}> = ({ id, accentColor }) => {
  if (id === 'modern') {
    const sidebarBg =
      accentColor === '#4F46E5'
        ? '#1E1B4B'
        : accentColor === '#059669'
          ? '#064E3B'
          : accentColor === '#9F1239'
            ? '#4C0519'
            : '#0F172A';
    return (
      <div className="w-full h-44 bg-white rounded-lg border border-slate-200 overflow-hidden flex shadow-2xs">
        <div
          className="w-[34%] h-full p-2.5 flex flex-col items-center gap-2"
          style={{ backgroundColor: sidebarBg }}
        >
          <div className="w-7 h-7 rounded-full bg-white/25 border border-white/40" />
          <div className="w-12 h-1.5 rounded bg-white/80" />
          <div className="w-9 h-1 rounded bg-white/40" />
          <div className="w-full border-t border-white/15 my-0.5" />
          <div className="w-full space-y-1">
            <div className="w-8 h-1 rounded bg-white/50" />
            <div className="flex flex-wrap gap-1">
              <span className="w-5 h-2 rounded-xs bg-white/20" />
              <span className="w-6 h-2 rounded-xs bg-white/20" />
              <span className="w-5 h-2 rounded-xs bg-white/20" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-3 space-y-2.5">
          <div className="space-y-1">
            <div className="w-14 h-1.5 rounded" style={{ backgroundColor: accentColor }} />
            <div className="w-full h-1 rounded bg-slate-200" />
            <div className="w-5/6 h-1 rounded bg-slate-200" />
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="w-16 h-1.5 rounded" style={{ backgroundColor: accentColor }} />
            <div className="w-3/4 h-1.5 rounded bg-slate-700" />
            <div className="w-full h-1 rounded bg-slate-200" />
            <div className="w-11/12 h-1 rounded bg-slate-200" />
            <div className="w-2/3 h-1.5 rounded bg-slate-700 pt-1" />
            <div className="w-full h-1 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (id === 'classic') {
    return (
      <div className="w-full h-44 bg-white rounded-lg border border-slate-200 overflow-hidden p-3.5 flex flex-col gap-2 shadow-2xs">
        <div
          className="pb-2 border-b-2 flex flex-col items-center gap-1"
          style={{ borderColor: accentColor }}
        >
          <div className="w-20 h-2 rounded bg-slate-900" />
          <div className="w-14 h-1.5 rounded" style={{ backgroundColor: accentColor }} />
          <div className="w-28 h-1 rounded bg-slate-300" />
        </div>
        <div className="space-y-1">
          <div className="w-16 h-1.5 rounded" style={{ backgroundColor: accentColor }} />
          <div className="w-full h-1 rounded bg-slate-200" />
          <div className="w-4/5 h-1 rounded bg-slate-200" />
        </div>
        <div className="space-y-1 pt-0.5">
          <div className="w-20 h-1.5 rounded" style={{ backgroundColor: accentColor }} />
          <div className="flex justify-between">
            <div className="w-16 h-1.5 rounded bg-slate-800" />
            <div className="w-8 h-1 rounded bg-slate-400" />
          </div>
          <div className="w-full h-1 rounded bg-slate-200" />
          <div className="w-5/6 h-1 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (id === 'minimal') {
    return (
      <div className="w-full h-44 bg-white rounded-lg border border-slate-200 overflow-hidden p-3.5 flex flex-col gap-2.5 shadow-2xs">
        <div className="pb-2 border-b border-slate-200 space-y-1">
          <div className="w-20 h-2 rounded bg-slate-900" />
          <div className="w-14 h-1 rounded" style={{ backgroundColor: accentColor }} />
          <div className="w-28 h-1 rounded bg-slate-300" />
        </div>
        <div className="space-y-1">
          <div className="w-10 h-1 rounded" style={{ backgroundColor: accentColor }} />
          <div className="w-full h-1 rounded bg-slate-200" />
          <div className="w-11/12 h-1 rounded bg-slate-200" />
        </div>
        <div className="space-y-1">
          <div className="w-12 h-1 rounded" style={{ backgroundColor: accentColor }} />
          <div className="w-3/4 h-1.5 rounded bg-slate-800" />
          <div className="w-full h-1 rounded bg-slate-200" />
          <div className="w-5/6 h-1 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (id === 'creative') {
    return (
      <div className="w-full h-44 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col shadow-2xs">
        <div
          className="px-3.5 py-2.5 flex items-center justify-between"
          style={{ backgroundColor: accentColor }}
        >
          <div className="space-y-1">
            <div className="w-10 h-1 rounded bg-white/60" />
            <div className="w-20 h-2 rounded bg-white" />
            <div className="w-24 h-1 rounded bg-white/75" />
          </div>
          <div className="w-7 h-7 rounded-lg bg-white/25 border border-white/50" />
        </div>
        <div className="flex-1 p-3 grid grid-cols-12 gap-2.5">
          <div className="col-span-8 space-y-1.5">
            <div className="w-12 h-1.5 rounded bg-slate-900" />
            <div className="p-1.5 rounded bg-slate-50 border border-slate-200 space-y-1">
              <div className="w-14 h-1.5 rounded bg-slate-700" />
              <div className="w-full h-1 rounded bg-slate-200" />
              <div className="w-4/5 h-1 rounded bg-slate-200" />
            </div>
          </div>
          <div className="col-span-4 space-y-1.5">
            <div
              className="p-1.5 rounded space-y-1"
              style={{ backgroundColor: 'rgba(79,70,229,0.08)' }}
            >
              <div className="w-8 h-1 rounded" style={{ backgroundColor: accentColor }} />
              <div className="w-full h-1.5 rounded bg-white" />
              <div className="w-4/5 h-1.5 rounded bg-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Executive
  return (
    <div className="w-full h-44 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col shadow-2xs">
      <div
        className="px-3.5 py-2.5 flex items-center justify-between border-b-2"
        style={{ backgroundColor: '#0F172A', borderColor: '#C59B27' }}
      >
        <div className="space-y-1">
          <div className="w-20 h-2 rounded bg-white" />
          <div className="w-14 h-1 rounded" style={{ backgroundColor: '#C59B27' }} />
        </div>
        <div
          className="w-7 h-7 rounded-xs bg-white/15 border"
          style={{ borderColor: '#C59B27' }}
        />
      </div>
      <div className="p-3 space-y-2 flex-1">
        <div className="flex items-center gap-1.5">
          <div className="w-14 h-1.5 rounded" style={{ backgroundColor: accentColor }} />
          <div className="flex-1 h-[1px]" style={{ backgroundColor: '#C59B27' }} />
        </div>
        <div className="w-full h-1 rounded bg-slate-200" />
        <div className="w-5/6 h-1 rounded bg-slate-200" />
        <div className="flex items-center gap-1.5 pt-1">
          <div className="w-16 h-1.5 rounded" style={{ backgroundColor: accentColor }} />
          <div className="flex-1 h-[1px]" style={{ backgroundColor: '#C59B27' }} />
        </div>
        <div className="w-3/4 h-1.5 rounded bg-slate-800" />
        <div className="w-full h-1 rounded bg-slate-200" />
      </div>
    </div>
  );
};

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ isOpen, onClose }) => {
  const selectedTemplate = useResumeStore((s) => s.resume.selectedTemplate);
  const accentColor = useResumeStore((s) => s.resume.accentColor);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const addToast = useResumeStore((s) => s.addToast);

  if (!isOpen) return null;

  const handleSelect = (id: TemplateId, name: string) => {
    setTemplate(id);
    addToast({
      type: 'success',
      title: `Switched to ${name}`,
      description: 'Your resume content has been preserved with the new layout.',
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-gallery-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2 id="template-gallery-title" className="text-lg font-bold text-slate-900">
              Choose Resume Template
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch layouts anytime — your personal details, experience, skills, and languages remain intact.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Template Gallery"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[75vh] overflow-y-auto">
          {TEMPLATE_DEFINITIONS.map((tpl) => {
            const isSelected = selectedTemplate === tpl.id;
            return (
              <div
                key={tpl.id}
                data-testid={`template-card-${tpl.id}`}
                onClick={() => handleSelect(tpl.id, tpl.name)}
                className={`group rounded-xl border p-4 flex flex-col justify-between gap-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-3">
                  <TemplateMiniThumbnail id={tpl.id} accentColor={accentColor} />

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{tpl.name}</h3>
                      <span className="text-[11px] font-medium text-slate-500">
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(tpl.id, tpl.name);
                  }}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Selected Template</span>
                    </>
                  ) : (
                    <span>Select {tpl.name}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
