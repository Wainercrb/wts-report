/**
 * ResultSection - Organism: Read-only result display (Ant Design style)
 * Shows results from LLM with structured formatting
 */

import React from 'react';
import { DocumentTextIcon } from '../../utils/IconMap';

/**
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.content - Result text/content
 */
export function ResultSection({ title = 'Result Summary', content = '' }) {
  return (
    <section className="w-full bg-white border border-gray-100 rounded-lg overflow-hidden mt-2 mb-4">
      {/* Header with icon */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <DocumentTextIcon className="text-gray-500 h-6 w-6" />
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>

      {/* Content area */}
      <div className="p-6 bg-gray-50">
        <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </div>
      </div>
    </section>
  );
}
