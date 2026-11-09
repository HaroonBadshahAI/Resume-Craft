import React, { useState } from 'react';
import { useResumeStore } from '../../lib/resume/store';
import { calculateATSScore } from '../../lib/resume/ats-score';
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';

export const ATSScore: React.FC = () => {
  const resume = useResumeStore((s) => s.resume);
  const [expanded, setExpanded] = useState(false);

  const report = calculateATSScore(resume);

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (report.totalScore / 100) * circumference;

  const strokeColor =
    report.totalScore >= 85
      ? '#16A34A'
      : report.totalScore >= 60
        ? '#4F46E5'
        : '#D97706';

  const statusTextColor =
    report.totalScore >= 85
      ? 'text-emerald-700'
      : report.totalScore >= 60
        ? 'text-indigo-700'
        : 'text-amber-700';

  return (
    <div
      className="bg-white border border-slate-200 rounded-xl px-4 py-3 transition-all"
      data-testid="ats-readiness-panel"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Circular Progress + Score */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="4.5"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke={strokeColor}
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 250ms ease' }}
              />
            </svg>
            <span
              className="absolute text-xs font-bold text-slate-900 tabular-nums"
              data-testid="ats-score-value"
            >
              {report.totalScore}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                ATS Readiness Estimate
              </h3>
              <span className={`text-xs font-semibold ${statusTextColor}`}>
                · {report.ratingLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              {report.passedCount} of {report.totalCount} completeness checks met ({report.totalScore}/100)
            </p>
          </div>
        </div>

        {/* Right: Toggle Checklist Button */}
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          aria-expanded={expanded}
        >
          <span>{expanded ? 'Hide Checklist' : 'View Checklist'}</span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Expandable 6-Point Checklist */}
      {expanded && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {report.criteria.map((item) => (
            <div
              key={item.id}
              className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                item.passed
                  ? 'bg-emerald-50/40 border-emerald-200/80'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              {item.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-semibold ${
                      item.passed ? 'text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0">
                    {item.earnedPoints}/{item.maxPoints}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  {item.suggestion}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
