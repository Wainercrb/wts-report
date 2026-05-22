/**
 * TextInput - Atomic input component
 * Supports: text input, textarea, readonly
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {string} props.value - Current input value
 * @param {Function} [props.onChange] - Change handler receives value string
 * @param {string} [props.placeholder=''] - Placeholder text
 * @param {boolean} [props.readOnly=false] - Read-only state
 * @param {string} [props.type='text'] - Input type: 'text' | 'textarea'
 * @param {string} [props.className=''] - Additional Tailwind classes
 */
export function TextInput({
  value,
  onChange,
  placeholder = '',
  readOnly = false,
  type = 'text',
  className = ''
}) {
  const baseClasses = 'w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition';
  const readOnlyClass = readOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white';

  if (type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`${baseClasses} ${readOnlyClass} min-h-40 resize-none ${className}`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`${baseClasses} ${readOnlyClass} ${className}`}
    />
  );
}
