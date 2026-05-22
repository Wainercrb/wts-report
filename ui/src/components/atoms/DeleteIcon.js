/**
 * DeleteIcon - Red X button for delete actions
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {Function} props.onClick - Delete handler
 * @param {string} [props.className='w-5 h-5'] - Additional Tailwind classes
 */
export function DeleteIcon({ onClick, className = 'w-5 h-5' }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition ${className}`}
      aria-label="Delete"
    >
      ✕
    </button>
  );
}
