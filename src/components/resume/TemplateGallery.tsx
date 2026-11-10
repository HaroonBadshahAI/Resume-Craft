import React, { useState } from 'react';
import {
  TEMPLATE_DEFINITIONS,
  TemplateId,
  TemplateCategory,
  AccentColorHex,
} from '../../lib/resume/types';
import { READY_TO_USE_STARTER_RESUMES } from '../../lib/resume/sample-data';
import { useResumeStore } from '../../lib/resume/store';
import { X, Check, Sparkles, LayoutGrid } from 'lucide-react';

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
            <div
              className="w-14 h-1.5 rounded"
              style={{ backgroundColor: accentColor }}
            />
            <div className="w-full h-1 rounded bg-slate-200" />
            <div className="w-5/6 h-1 rounded bg-slate-200" />
          </div>
          <div className="space-y-1.5 pt-1">
            <div
              className="w-16 h-1.5 rounded"
              style={{ backgroundColor: accentColor }}
            />
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
          <div
            className="w-14 h-1.5 rounded"
            style={{ backgroundColor: accentColor }}
          />
          <div className="w-28 h-1 rounded bg-slate-300" />
        </div>
        <div className="space-y-1">
          <div
            className="w-16 h-1.5 rounded"
            style={{ backgroundColor: accentColor }}
          />
          <div className="w-full h-1 rounded bg-slate-200" />
          <div className="w-4/5 h-1 rounded bg-slate-200" />
        </div>
        <div className="space-y-1 pt-0.5">
          <div
            className="w-20 h-1.5 rounded"
            style={{ backgroundColor: accentColor }}
          />
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

  if (id === 'harvard') {
    return (
      <div className="w-full h-44 bg-white rounded-lg border border-slate-200 overflow-hidden p-3.5 flex flex-col gap-2 shadow-2xs">
        <div
          className="pb-1.5 border-b-2 flex flex-col items-center gap-1"
          style={{ borderColor: accentColor }}
        >
          <div className="w-24 h-2 rounded bg-slate-950" />
          <div className="w-32 h-1 rounded bg-slate-400" />
        </div>
        <div className="space-y-1">
          <div
            className="w-full pb-0.5 border-b border-slate-300 flex items-center"
          >
            <div
              className="w-16 h-1 rounded"
              style={{ backgroundColor: accentColor }}
            />
          </div>
          <div className="flex justify-between items-center pt-0.5">
            <div className="w-20 h-1.5 rounded bg-slate-900" />
            <div className="w-10 h-1 rounded bg-slate-500" />
          </div>
          <div className="flex justify-between items-center">
            <div className="w-16 h-1 rounded bg-slate-500" />
            <div className="w-12 h-1 rounded bg-slate-400" />
          </div>
          <div className="w-full h-1 rounded bg-slate-200" />
          <div className="w-11/12 h-1 rounded bg-slate-200" />
        </div>
        <div className="space-y-1 pt-0.5">
          <div className="w-full pb-0.5 border-b border-slate-300">
            <div
              className="w-14 h-1 rounded"
              style={{ backgroundColor: accentColor }}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="w-20 h-1.5 rounded bg-slate-900" />
            <div className="w-10 h-1 rounded bg-slate-400" />
          </div>
        </div>
      </div>
    );
  }

  if (id === 'minimal') {
    return (
      <div className="w-full h-44 bg-white rounded-lg border border-slate-200 overflow-hidden p-3.5 flex flex-col gap-2.5 shadow-2xs">
        <div className="pb-2 border-b border-slate-200 space-y-1">
          <div className="w-20 h-2 rounded bg-slate-900" />
          <div
            className="w-14 h-1 rounded"
            style={{ backgroundColor: accentColor }}
          />
          <div className="w-28 h-1 rounded bg-slate-300" />
        </div>
        <div className="space-y-1">
          <div
            className="w-10 h-1 rounded"
            style={{ backgroundColor: accentColor }}
          />
          <div className="w-full h-1 rounded bg-slate-200" />
          <div className="w-11/12 h-1 rounded bg-slate-200" />
        </div>
        <div className="space-y-1">
          <div
            className="w-12 h-1 rounded"
            style={{ backgroundColor: accentColor }}
          />
          <div className="w-3/4 h-1.5 rounded bg-slate-800" />
          <div className="w-full h-1 rounded bg-slate-200" />
          <div className="w-5/6 h-1 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (id === 'tech') {
    return (
      <div className="w-full h-44 bg-white rounded-lg border border-slate-200 overflow-hidden p-3 flex flex-col gap-2 shadow-2xs">
        <div className="pb-2 border-b-2 border-slate-900 flex justify-between items-start">
          <div className="space-y-1">
            <div
              className="w-8 h-1.5 rounded-xs"
              style={{ backgroundColor: accentColor }}
            />
            <div className="w-20 h-2 rounded bg-slate-950" />
            <div className="w-24 h-1 rounded bg-slate-400" />
          </div>
          <div className="w-10 h-3 rounded-xs bg-slate-100 border border-slate-300" />
        </div>
        {/* Tech Stack Matrix Bar */}
        <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex flex-wrap gap-1">
          <span
            className="w-7 h-2 rounded-xs border bg-white"
            style={{ borderColor: accentColor }}
          />
          <span className="w-9 h-2 rounded-xs border border-slate-300 bg-white" />
          <span className="w-6 h-2 rounded-xs border border-slate-300 bg-white" />
          <span className="w-8 h-2 rounded-xs border border-slate-300 bg-white" />
        </div>
        {/* Left-bordered Experience */}
        <div
          className="pl-2 border-l-2 space-y-1"
          style={{ borderColor: accentColor }}
        >
          <div className="flex justify-between">
            <div className="w-16 h-1.5 rounded bg-slate-900" />
            <div className="w-10 h-1 rounded bg-slate-400" />
          </div>
          <div className="w-full h-1 rounded bg-slate-200" />
          <div className="w-5/6 h-1 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (id === 'nordic') {
    return (
      <div className="w-full h-44 bg-white rounded-lg border border-slate-200 overflow-hidden flex shadow-2xs">
        <div className="flex-1 p-3 space-y-2.5">
          <div className="space-y-1 pb-1.5 border-b border-slate-200">
            <div
              className="w-10 h-1.5 rounded-xs"
              style={{ backgroundColor: accentColor }}
            />
            <div className="w-20 h-2 rounded bg-slate-900" />
          </div>
          <div className="pl-2.5 border-l-2 border-slate-200 space-y-1.5 relative">
            <div
              className="w-2 h-2 rounded-full absolute -left-[5px] top-0"
              style={{ backgroundColor: accentColor }}
            />
            <div className="w-16 h-1.5 rounded bg-slate-800" />
            <div className="w-full h-1 rounded bg-slate-200" />
            <div className="w-4/5 h-1 rounded bg-slate-200" />
          </div>
        </div>
        <div
          className="w-[34%] h-full p-2.5 border-l border-slate-200 flex flex-col items-center gap-2"
          style={{ backgroundColor: 'rgba(79,70,229,0.06)' }}
        >
          <div
            className="w-7 h-7 rounded-full bg-white border-2"
            style={{ borderColor: accentColor }}
          />
          <div className="w-full space-y-1">
            <div
              className="w-10 h-1 rounded"
              style={{ backgroundColor: accentColor }}
            />
            <div className="w-full h-1.5 rounded bg-white border border-slate-200" />
            <div className="w-4/5 h-1.5 rounded bg-white border border-slate-200" />
          </div>
          <div className="w-full space-y-1 pt-1">
            <div className="w-full h-1 rounded-full bg-white overflow-hidden">
              <div
                className="w-4/5 h-full"
                style={{ backgroundColor: accentColor }}
              />
            </div>
            <div className="w-full h-1 rounded-full bg-white overflow-hidden">
              <div
                className="w-3/5 h-full"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          </div>
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
              <div
                className="w-8 h-1 rounded"
                style={{ backgroundColor: accentColor }}
              />
              <div className="w-full h-1.5 rounded bg-white" />
              <div className="w-4/5 h-1.5 rounded bg-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (id === 'swiss') {
    return (
      <div className="w-full h-44 bg-white rounded-lg border border-slate-200 overflow-hidden p-3 flex flex-col shadow-2xs">
        <div
          className="border-t-4 border-b border-slate-900 py-2 grid grid-cols-12 gap-2"
          style={{ borderTopColor: accentColor }}
        >
          <div className="col-span-8 space-y-1">
            <div
              className="w-8 h-1 rounded-xs"
              style={{ backgroundColor: accentColor }}
            />
            <div className="w-20 h-2.5 rounded-xs bg-slate-950" />
          </div>
          <div className="col-span-4 border-l border-slate-200 pl-2 space-y-1">
            <div className="w-full h-1 rounded bg-slate-300" />
            <div className="w-4/5 h-1 rounded bg-slate-300" />
          </div>
        </div>
        <div className="py-2 border-b border-slate-200 grid grid-cols-12 gap-2">
          <div className="col-span-3 space-y-0.5">
            <div
              className="w-3 h-1 rounded-xs"
              style={{ backgroundColor: accentColor }}
            />
            <div className="w-8 h-1 rounded bg-slate-800" />
          </div>
          <div className="col-span-9 space-y-1">
            <div className="w-full h-1 rounded bg-slate-200" />
            <div className="w-5/6 h-1 rounded bg-slate-200" />
          </div>
        </div>
        <div className="py-2 grid grid-cols-12 gap-2 flex-1">
          <div className="col-span-3 space-y-0.5">
            <div
              className="w-3 h-1 rounded-xs"
              style={{ backgroundColor: accentColor }}
            />
            <div className="w-10 h-1 rounded bg-slate-800" />
          </div>
          <div className="col-span-9 space-y-1">
            <div className="w-16 h-1.5 rounded bg-slate-900" />
            <div className="w-full h-1 rounded bg-slate-200" />
            <div className="w-4/5 h-1 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (id === 'metro') {
    return (
      <div className="w-full h-44 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col shadow-2xs">
        <div className="grid grid-cols-12">
          <div className="col-span-8 bg-slate-950 p-2.5 flex items-center gap-2">
            <div
              className="w-6 h-6 rounded bg-white/15 border"
              style={{ borderColor: accentColor }}
            />
            <div className="space-y-1">
              <div
                className="w-10 h-1 rounded-xs"
                style={{ backgroundColor: accentColor }}
              />
              <div className="w-16 h-2 rounded bg-white" />
            </div>
          </div>
          <div
            className="col-span-4 p-2 flex flex-col justify-center gap-1"
            style={{ backgroundColor: accentColor }}
          >
            <div className="w-full h-1 rounded bg-white/80" />
            <div className="w-3/4 h-1 rounded bg-white/60" />
          </div>
        </div>
        <div className="p-2.5 grid grid-cols-12 gap-2 flex-1">
          <div className="col-span-8 space-y-1.5">
            <div
              className="p-1.5 rounded border border-slate-200 border-l-4 space-y-1"
              style={{ borderLeftColor: accentColor }}
            >
              <div className="w-14 h-1.5 rounded bg-slate-900" />
              <div className="w-full h-1 rounded bg-slate-200" />
              <div className="w-4/5 h-1 rounded bg-slate-200" />
            </div>
          </div>
          <div className="col-span-4 space-y-1">
            <div className="w-8 h-1 rounded bg-slate-800" />
            <div className="flex flex-wrap gap-1">
              <span
                className="w-6 h-2 rounded-xs"
                style={{ backgroundColor: accentColor }}
              />
              <span
                className="w-5 h-2 rounded-xs"
                style={{ backgroundColor: accentColor }}
              />
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
          <div
            className="w-14 h-1 rounded"
            style={{ backgroundColor: '#C59B27' }}
          />
        </div>
        <div
          className="w-7 h-7 rounded-xs bg-white/15 border"
          style={{ borderColor: '#C59B27' }}
        />
      </div>
      <div className="p-3 space-y-2 flex-1">
        <div className="flex items-center gap-1.5">
          <div
            className="w-14 h-1.5 rounded"
            style={{ backgroundColor: accentColor }}
          />
          <div className="flex-1 h-[1px]" style={{ backgroundColor: '#C59B27' }} />
        </div>
        <div className="w-full h-1 rounded bg-slate-200" />
        <div className="w-5/6 h-1 rounded bg-slate-200" />
        <div className="flex items-center gap-1.5 pt-1">
          <div
            className="w-16 h-1.5 rounded"
            style={{ backgroundColor: accentColor }}
          />
          <div className="flex-1 h-[1px]" style={{ backgroundColor: '#C59B27' }} />
        </div>
        <div className="w-3/4 h-1.5 rounded bg-slate-800" />
        <div className="w-full h-1 rounded bg-slate-200" />
      </div>
    </div>
  );
};

type GalleryFilter = 'all' | TemplateCategory | 'starters';

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  isOpen,
  onClose,
}) => {
  const selectedTemplate = useResumeStore((s) => s.resume.selectedTemplate);
  const accentColor = useResumeStore((s) => s.resume.accentColor);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const loadStarterPreset = useResumeStore((s) => s.loadStarterPreset);
  const addToast = useResumeStore((s) => s.addToast);

  const [activeFilter, setActiveFilter] = useState<GalleryFilter>('all');

  if (!isOpen) return null;

  const handleSelect = (id: TemplateId, name: string) => {
    setTemplate(id);
    addToast({
      type: 'success',
      title: `Switched to ${name}`,
      description:
        'Your resume content has been preserved with the new layout.',
    });
    onClose();
  };

  const handleApplyStarter = (presetId: string) => {
    loadStarterPreset(presetId);
    onClose();
  };

  const filteredTemplates =
    activeFilter === 'all' || activeFilter === 'starters'
      ? TEMPLATE_DEFINITIONS
      : TEMPLATE_DEFINITIONS.filter((t) => t.category === activeFilter);

  const filterButtons: { id: GalleryFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All Templates', count: TEMPLATE_DEFINITIONS.length },
    {
      id: 'professional',
      label: 'Professional',
      count: TEMPLATE_DEFINITIONS.filter((t) => t.category === 'professional')
        .length,
    },
    {
      id: 'modern',
      label: 'Modern',
      count: TEMPLATE_DEFINITIONS.filter((t) => t.category === 'modern').length,
    },
    {
      id: 'creative',
      label: 'Creative',
      count: TEMPLATE_DEFINITIONS.filter((t) => t.category === 'creative')
        .length,
    },
    {
      id: 'starters',
      label: 'Ready-to-Use Role Resumes',
      count: READY_TO_USE_STARTER_RESUMES.length,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-gallery-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-6xl w-full overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div>
            <h2
              id="template-gallery-title"
              className="text-lg font-bold text-slate-900"
            >
              Choose Resume Template & Ready-to-Use Starters
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch between 10 Professional, Modern, and Creative layouts anytime — or load a complete Ready-to-Use industry resume in one click.
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

        {/* Filter Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          {filterButtons.map((tab) => {
            const isActive = activeFilter === tab.id;
            const isStarterTab = tab.id === 'starters';
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`gallery-filter-${tab.id}`}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : isStarterTab
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isStarterTab ? (
                  <Sparkles className="w-3.5 h-3.5" />
                ) : (
                  <LayoutGrid className="w-3.5 h-3.5" />
                )}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8 min-h-0 flex-1">
          {/* Templates Grid */}
          {activeFilter !== 'starters' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTemplates.map((tpl) => {
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
                      <TemplateMiniThumbnail
                        id={tpl.id}
                        accentColor={accentColor}
                      />

                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {tpl.name}
                          </h3>
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
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
          )}

          {/* Ready-to-Use Industry Starter Resumes Section */}
          {(activeFilter === 'all' || activeFilter === 'starters') && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Ready-to-Use Industry Starter Resumes
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Want a pre-written starting point? Load a complete, role-tailored sample resume paired with its ideal template and color palette.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {READY_TO_USE_STARTER_RESUMES.map((preset) => (
                  <div
                    key={preset.id}
                    data-testid={`starter-preset-${preset.id}`}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-300 p-4 flex flex-col justify-between gap-4 transition-all"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {preset.categoryLabel}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {preset.recommendedTemplateName}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {preset.roleTitle}
                        </h4>
                        <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                          Sample Profile: {preset.data.personal.fullName} ·{' '}
                          {preset.data.personal.location}
                        </p>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {preset.data.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      data-testid={`apply-starter-${preset.id}`}
                      onClick={() => handleApplyStarter(preset.id)}
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Use Ready-to-Use Template</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
