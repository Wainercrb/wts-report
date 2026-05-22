/**
 * AddedItems - Organism: List of empty items being worked on (Ant Design style)
 * Displays items that haven't been filled yet with Save action
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {Array} props.items - Array of added items with {id, text}
 * @param {Function} [props.onSave] - Callback when Save button is clicked with item.id
 */
export function AddedItems({ items = [], onSave }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white border border-gray-100 rounded-lg overflow-hidden mb-4">
      {/* Header with icon */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <span className="material-symbols-outlined text-blue-500 text-xl">add_circle</span>
        <h3 className="text-sm font-semibold text-gray-900 m-0">Added Items</h3>
      </div>

      {/* Items list with dividers */}
      <div className="border-t border-gray-100">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="px-6 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between cursor-pointer last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
              <span className="material-symbols-outlined text-base text-blue-500">
                {item.tsType === 'task' ? 'assignment' : 'meeting'}
              </span>
              <span className="text-sm text-gray-900">{item.tsText || item.text}</span>
            </div>
            <button
              onClick={() => onSave?.(item.id)}
              className="text-blue-500 hover:text-blue-600 transition-colors duration-200 text-sm font-medium flex items-center gap-1 bg-transparent border-0 cursor-pointer px-2 py-1 rounded"
            >
              <span className="material-symbols-outlined text-base">save</span>
              Save
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
