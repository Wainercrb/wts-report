/**
 * Label - Atomic label component
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - Label text/content
 * @param {string} [props.htmlFor] - Associated input ID
 * @param {boolean} [props.required=false] - Show required indicator
 * @param {string} [props.className=''] - Additional Tailwind classes
 */
export function Label({ children, htmlFor, required = false, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
