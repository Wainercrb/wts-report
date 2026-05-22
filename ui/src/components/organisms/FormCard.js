/**
 * FormCard - Organism: Card wrapper for form sections
 * Provides consistent styling for form sections with optional title/subtitle
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {string} [props.title] - Card title
 * @param {string} [props.subtitle] - Card subtitle (smaller, gray text)
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className=''] - Additional Tailwind classes
 */
export function FormCard({ title, subtitle = null, children, className = '' }) {
  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-4 ${className}`}>
      {title && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
