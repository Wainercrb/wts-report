/**
 * AddedItems - Organism: List of empty items being worked on (Ant Design style)
 * Displays items that haven't been filled yet with Save action
 */

import React from 'react';
import { PlusCircleIcon, CheckCircleIcon, CheckIcon, UsersIcon, ArrowDownTrayIcon, XMarkIcon } from '../../utils/IconMap';

/**
 * @param {Object} props
 * @param {Array} props.items - Array of added items with {id, text}
 * @param {Function} [props.onSave] - Callback when Save button is clicked with item.id
 * @param {Function} [props.onDelete] - Callback when Delete button is clicked with item.id
 * @param {Function} [props.onRemoveAll] - Callback when "Remove all" button is clicked with tsType
 */
export function AddedItems({ items = [], onSave, onDelete, onRemoveAll }) {
  if (items.length === 0) {
    return null;
  }

  // Group items by type
  function groupItemsByType(itemsList) {
    const grouped = { meeting: [], tasks: [] };
    itemsList.forEach(item => {
      if (item.tsType === 'meeting') {
        grouped.meeting.push(item);
      } else {
        grouped.tasks.push(item);
      }
    });
    return grouped;
  }

  const grouped = groupItemsByType(items);

  // Render a group section
  function renderGroup(tsType, typeLabel, typeIcon, itemsList) {
    if (itemsList.length === 0) return null;

    return (
      <div key={tsType} className="mb-2">
        <div className="w-full bg-white border border-gray-100 rounded-lg overflow-hidden">
          {/* Group header */}
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {typeIcon}
              <h3 className="text-sm font-semibold text-gray-900 m-0">{typeLabel} ({itemsList.length})</h3>
            </div>
            <button
              onClick={() => onRemoveAll?.(tsType)}
              className="text-gray-400 hover:text-red-500 transition-colors duration-200 text-sm font-medium flex items-center gap-1 bg-transparent border-0 cursor-pointer px-2 py-1 rounded"
              title="Remove all items"
            >
              Remove all
            </button>
          </div>

          {/* Items in group */}
          <div className="border-t border-gray-100">
            {itemsList.map((item) => (
              <div
                key={item.id}
                className="px-4 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="text-green-500 h-6 w-6" />
                  <span className="text-sm text-gray-900">{item.tsText || item.text}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSave?.(item.id)}
                    className="text-blue-500 hover:text-blue-600 transition-colors duration-200 text-sm font-medium flex items-center gap-1 bg-transparent border-0 cursor-pointer px-2 py-1 rounded"
                  >
                    <ArrowDownTrayIcon className="h-6 w-6" />
                    Save
                  </button>
                  <button
                    onClick={() => onDelete?.(item.id)}
                    className="text-red-400 hover:text-red-600 transition-colors duration-200 flex items-center gap-1 bg-transparent border-0 cursor-pointer px-2 py-1 rounded"
                    title="Delete item"
                  >
                    <XMarkIcon className="h-6 w-6" aria-label="delete icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full mb-2">
      {/* Header with icon */}
      <div className="px-6 py-4 mb-2 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-900 m-0">Added Items</h3>
      </div>

      {/* Groups */}
      {renderGroup('meeting', 'Meetings', <UsersIcon className="text-blue-600 h-6 w-6" aria-label="meetings icon" />, grouped.meeting)}
      {renderGroup('tasks', 'Tasks', <CheckIcon className="text-blue-600 h-6 w-6" aria-label="tasks icon" />, grouped.tasks)}
    </section>
  );
}
