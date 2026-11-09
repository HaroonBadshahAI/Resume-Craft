import React, { forwardRef } from 'react';
import { ResumeData } from '../../lib/resume/types';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '../../lib/resume/pdf-export';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { ExecutiveTemplate } from './templates/ExecutiveTemplate';

interface ResumeDocumentProps {
  data: ResumeData;
  showPageGuides?: boolean;
}

/**
 * Shared A4 ResumeDocument component used identically for:
 * 1. The live interactive preview (scaled via CSS transform wrapper)
 * 2. The off-screen unscaled A4 PDF export container
 */
export const ResumeDocument = forwardRef<HTMLDivElement, ResumeDocumentProps>(
  ({ data, showPageGuides = false }, ref) => {
    const renderSelectedTemplate = () => {
      switch (data.selectedTemplate) {
        case 'modern':
          return <ModernTemplate data={data} />;
        case 'classic':
          return <ClassicTemplate data={data} />;
        case 'minimal':
          return <MinimalTemplate data={data} />;
        case 'creative':
          return <CreativeTemplate data={data} />;
        case 'executive':
          return <ExecutiveTemplate data={data} />;
        default:
          return <ModernTemplate data={data} />;
      }
    };

    return (
      <div
        ref={ref}
        data-testid="resume-document"
        data-template={data.selectedTemplate}
        data-accent={data.accentColor}
        className="relative bg-white text-[#0F172A] shadow-none overflow-hidden"
        style={{
          width: `${A4_WIDTH_PX}px`,
          minHeight: `${A4_HEIGHT_PX}px`,
        }}
      >
        {renderSelectedTemplate()}

        {/* Optional visual page-break indicator line in live preview when content exceeds 1 A4 page */}
        {showPageGuides && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 border-b-2 border-dashed border-indigo-400/50 flex justify-end pr-3"
            style={{ top: `${A4_HEIGHT_PX}px` }}
          >
            <span className="bg-indigo-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-t">
              Page 1 End (A4 Boundary)
            </span>
          </div>
        )}
      </div>
    );
  }
);

ResumeDocument.displayName = 'ResumeDocument';
