/**
 * StoredItems - Organism: List of stored/saved items (Ant Design style)
 * Displays saved items with checkboxes to select which ones to submit and delete button
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {Array} props.items - Array of stored items with {id, idx, text, isChecked}
 * @param {Function} [props.onToggleCheck] - Callback when checkbox is toggled, called with item.idx
 * @param {Function} [props.onDelete] - Callback when delete button is clicked, called with item.id
 */
export function StoredItems({ items = [], onToggleCheck, onDelete }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white border border-gray-100 rounded-lg overflow-hidden mb-4">
      {/* Header with icon */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <span className="material-symbols-outlined text-blue-600 text-xl">inventory_2</span>
        <h3 className="text-sm font-semibold text-gray-900">Stored Items</h3>
      </div>

      {/* Items list with dividers */}
      <div className="border-t border-gray-100">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="px-6 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 cursor-pointer"
          >
            <input
              type="checkbox"
              id={`stored-${item.id}`}
              checked={item.isChecked}
              onChange={() => onToggleCheck?.(item.idx)}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer flex-shrink-0"
            />
            <span className="material-symbols-outlined text-blue-600 text-base flex-shrink-0">
              {item.tsType === 'task' ? 'assignment' : 'meeting'}
            </span>
            <label
              htmlFor={`stored-${item.id}`}
              className="text-sm text-gray-900 cursor-pointer flex-1 font-normal"
            >
              {item.tsText || item.text}
            </label>
            <button
              onClick={() => onDelete?.(item.id)}
              className="text-gray-400 hover:text-red-500 transition-colors duration-200 cursor-pointer px-2 py-1 rounded"
              title="Delete item"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

