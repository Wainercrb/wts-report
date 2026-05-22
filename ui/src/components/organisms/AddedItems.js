/**
 * AddedItems - Organism: List of empty items being worked on (Ant Design style)
 * Displays items that haven't been filled yet with Save action
 */

import React from 'react';
import { PlusCircleIcon, CheckCircleIcon, CheckIcon, UsersIcon, ArrowDownTrayIcon } from '../../utils/IconMap';

/**
 * @param {Object} props
 * @param {Array} props.items - Array of added items with {id, text}
 * @param {Function} [props.onSave] - Callback when Save button is clicked with item.id
 * @param {Function} [props.onDelete] - Callback when Delete button is clicked with item.id
 */
export function AddedItems({ items = [], onSave, onDelete }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white border border-gray-100 rounded-lg overflow-hidden mb-4">
      {/* Header with icon */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <PlusCircleIcon className="text-blue-500 h-6 w-6" />
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
              <CheckCircleIcon className="text-green-500 h-6 w-6" />
              {item.tsType === 'meeting' ? (
                <UsersIcon className="text-blue-500 h-6 w-6" aria-label="meeting icon" />
              ) : (
                <CheckIcon className="text-blue-500 h-6 w-6" aria-label="task icon" />
              )}
              <span className="text-sm text-gray-900">{item.tsText || item.text}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDelete?.(item.id)}
                className="text-red-400 hover:text-red-600 transition-colors duration-200 text-sm font-medium flex items-center gap-1 bg-transparent border-0 cursor-pointer px-2 py-1 rounded"
                title="Delete item"
              >
                ✕
              </button>
              <button
                onClick={() => onSave?.(item.id)}
                className="text-blue-500 hover:text-blue-600 transition-colors duration-200 text-sm font-medium flex items-center gap-1 bg-transparent border-0 cursor-pointer px-2 py-1 rounded"
              >
                <ArrowDownTrayIcon className="h-6 w-6" />
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
