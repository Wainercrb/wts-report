/**
 * TabButton - Molecule: Individual tab button
 * Shows active/inactive state, used within TabNav
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {string} props.label - Tab label
 * @param {boolean} props.isActive - Whether tab is currently active
 * @param {Function} props.onClick - Click handler
 * @param {string} [props.className=''] - Additional Tailwind classes
 */
export function TabButton({ label, isActive, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`px-4 py-2 border-b-2 transition font-medium ${
        isActive
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      } ${className}`}
    >
      {label}
    </button>
  );
}
