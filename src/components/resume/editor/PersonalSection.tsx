import React from 'react';
import { useResumeStore } from '../../../lib/resume/store';
import { PhotoUploader } from '../PhotoUploader';
import { Wand2 } from 'lucide-react';

export const PersonalSection: React.FC = () => {
  const personal = useResumeStore((s) => s.resume.personal);
  const summary = useResumeStore((s) => s.resume.summary);
  const updatePersonal = useResumeStore((s) => s.updatePersonal);
  const setSummary = useResumeStore((s) => s.setSummary);
  const writeSummaryForMe = useResumeStore((s) => s.writeSummaryForMe);

  const summaryWords = summary.trim()
    ? summary.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Personal Information Card */}
      <section
        id="editor-personal"
        className="bg-white rounded-xl border border-slate-200 p-5 space-y-5"
      >
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Contact details and headline shown at the top of your resume.
          </p>
        </div>

        {/* Profile Photo Uploader */}
        <PhotoUploader />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="input-full-name"
              className="block text-xs font-semibold text-slate-700"
            >
              Full Name
            </label>
            <input
              id="input-full-name"
              type="text"
              value={personal.fullName}
              onChange={(e) => updatePersonal({ fullName: e.target.value })}
              placeholder="e.g. Ayesha Khan"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="input-job-title"
              className="block text-xs font-semibold text-slate-700"
            >
              Professional Job Title
            </label>
            <input
              id="input-job-title"
              type="text"
              value={personal.jobTitle}
              onChange={(e) => updatePersonal({ jobTitle: e.target.value })}
              placeholder="e.g. Senior Digital Marketing Manager"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="input-email"
              className="block text-xs font-semibold text-slate-700"
            >
              Email Address
            </label>
            <input
              id="input-email"
              type="email"
              value={personal.email}
              onChange={(e) => updatePersonal({ email: e.target.value })}
              placeholder="e.g. ayesha.khan@example.com"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="input-phone"
              className="block text-xs font-semibold text-slate-700"
            >
              Phone Number
            </label>
            <input
              id="input-phone"
              type="tel"
              value={personal.phone}
              onChange={(e) => updatePersonal({ phone: e.target.value })}
              placeholder="e.g. +971 50 123 4567"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="input-location"
              className="block text-xs font-semibold text-slate-700"
            >
              City / Country
            </label>
            <input
              id="input-location"
              type="text"
              value={personal.location}
              onChange={(e) => updatePersonal({ location: e.target.value })}
              placeholder="e.g. Dubai, UAE"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="input-linkedin"
              className="block text-xs font-semibold text-slate-700"
            >
              LinkedIn URL
            </label>
            <input
              id="input-linkedin"
              type="url"
              value={personal.linkedin}
              onChange={(e) => updatePersonal({ linkedin: e.target.value })}
              placeholder="e.g. linkedin.com/in/ayesha-khan-demo"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label
              htmlFor="input-website"
              className="block text-xs font-semibold text-slate-700"
            >
              Website / Portfolio
            </label>
            <input
              id="input-website"
              type="url"
              value={personal.website}
              onChange={(e) => updatePersonal({ website: e.target.value })}
              placeholder="e.g. ayeshakhan.marketing"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Professional Summary Card */}
      <section
        id="editor-summary"
        className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Professional Summary</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Aim for 40+ words highlighting your core expertise and value proposition.
            </p>
          </div>

          <button
            type="button"
            onClick={writeSummaryForMe}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Write it for me</span>
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="input-summary" className="font-semibold text-slate-700">
              Summary Text
            </label>
            <span
              className={`font-mono tabular-nums ${
                summaryWords >= 40 ? 'text-emerald-600 font-semibold' : 'text-slate-500'
              }`}
            >
              {summaryWords} {summaryWords === 1 ? 'word' : 'words'}{' '}
              {summaryWords >= 40 ? '(ATS target met)' : '(40+ words recommended)'}
            </span>
          </div>
          <textarea
            id="input-summary"
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Summarize your professional background, core skills, and impact..."
            className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors leading-relaxed"
          />
        </div>
      </section>
    </div>
  );
};
