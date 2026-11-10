import React from 'react';

interface ResumeDateInputProps {
  id: string;
  value: string;
  onChange: (nextValue: string) => void;
  min?: string;
  disabled?: boolean;
  ariaLabel?: string;
  hasWarning?: boolean;
}

/**
 * Smart date input that natively supports YYYY-MM via HTML5 `type="month"`,
 * while also preserving and displaying year-only dates ("2022") imported from resumes
 * without inventing a month (January/December).
 */
export const ResumeDateInput: React.FC<ResumeDateInputProps> = ({
  id,
  value,
  onChange,
  min,
  disabled = false,
  ariaLabel,
  hasWarning = false,
}) => {
  const trimmed = (value || '').trim();
  const isYearOnly = /^(?:19|20)\d{2}$/.test(trimmed);

  const borderClass = hasWarning
    ? 'border-amber-400 bg-amber-50/30 focus:ring-amber-500/20 focus:border-amber-600'
    : 'border-slate-200 bg-white focus:ring-indigo-600/20 focus:border-indigo-600';

  if (isYearOnly && !disabled) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          id={id}
          type="text"
          aria-label={ariaLabel}
          value={trimmed}
          onChange={(e) => onChange(e.target.value)}
          placeholder="YYYY or YYYY-MM"
          className={`flex-1 min-w-0 px-3 py-2 text-sm border rounded-lg text-slate-900 focus:outline-none focus:ring-2 tabular-nums ${borderClass}`}
        />
        <select
          aria-label={`Select month for ${trimmed}`}
          value=""
          onChange={(e) => {
            if (e.target.value) {
              onChange(`${trimmed}-${e.target.value}`);
            }
          }}
          className="px-2 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg text-slate-700 cursor-pointer shrink-0"
          title="Add month to year-only date"
        >
          <option value="">+ Month</option>
          <option value="01">Jan</option>
          <option value="02">Feb</option>
          <option value="03">Mar</option>
          <option value="04">Apr</option>
          <option value="05">May</option>
          <option value="06">Jun</option>
          <option value="07">Jul</option>
          <option value="08">Aug</option>
          <option value="09">Sep</option>
          <option value="10">Oct</option>
          <option value="11">Nov</option>
          <option value="12">Dec</option>
        </select>
      </div>
    );
  }

  const validMin = min && /^\d{4}-\d{2}$/.test(min) ? min : undefined;

  return (
    <input
      id={id}
      type="month"
      aria-label={ariaLabel}
      min={validMin}
      disabled={disabled}
      value={disabled ? '' : trimmed}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 text-sm border rounded-lg text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 tabular-nums ${borderClass}`}
    />
  );
};
