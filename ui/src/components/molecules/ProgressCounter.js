/**
 * ProgressCounter - Molecule: Item N of M display
 * Shows current progress through a list/form
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {number} props.current - Current item number (1-indexed)
 * @param {number} props.total - Total items
 * @param {string} [props.label='Item'] - Label text (e.g., "Step", "Item")
 * @param {string} [props.className=''] - Additional Tailwind classes
 */
export function ProgressCounter({ current, total, label = 'Item', className = '' }) {
  return (
    <div className={`text-sm text-gray-600 font-medium ${className}`}>
      {label} {current} of {total}
    </div>
  );
}
