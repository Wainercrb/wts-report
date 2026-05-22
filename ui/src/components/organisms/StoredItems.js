/**
 * StoredItems - Organism: List of stored/saved items (Ant Design style)
 * Displays saved items with checkboxes to select which ones to submit and delete button
 */

import React from 'react';
import { ArchiveBoxIcon, CheckIcon, UsersIcon, XMarkIcon } from '../../utils/IconMap';

// Helper: Group items by tsType
function groupItemsByType(items) {
  const groups = items.reduce((acc, item) => {
    if (!acc[item.tsType]) {
      acc[item.tsType] = [];
    }
    acc[item.tsType].push(item);
    return acc;
  }, {});
  
  // Return with stable order (meeting first, then tasks)
  return {
    meeting: groups.meeting || [],
    tasks: groups.tasks || []
  };
}

/**
 * @param {Object} props
 * @param {Array} props.items - Array of stored items with {id, idx, text, isChecked, tsType}
 * @param {Function} [props.onToggleCheck] - Callback when checkbox is toggled, called with item.idx
 * @param {Function} [props.onDelete] - Callback when delete button is clicked, called with item.id
 * @param {Function} [props.onRemoveAll] - Callback when "Remove all" button clicked, called with type ('meeting' or 'tasks')
 */
export function StoredItems({ items = [], onToggleCheck, onDelete, onRemoveAll }) {
  if (items.length === 0) {
    return null;
  }
  
  const groups = groupItemsByType(items);
  const groupOrder = ['meeting', 'tasks'];
  
  // Render a group section
  function renderGroup(type, typeLabel, typeIcon, groupItems) {
    if (!groupItems || groupItems.length === 0) return null;
    
    return (
      <div key={type} className="mb-4">
        <div className="w-full bg-white border border-gray-100 rounded-lg overflow-hidden">
          {/* Group header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {typeIcon}
              <h3 className="text-sm font-semibold text-gray-900 m-0">{typeLabel} ({groupItems.length})</h3>
            </div>
            <button
              onClick={() => onRemoveAll?.(type)}
              aria-label={`Remove all ${typeLabel.toLowerCase()}`}
              className="text-gray-400 hover:text-red-500 transition-colors px-2 py-1 text-sm font-medium"
            >
              Remove all
            </button>
          </div>
          
          {/* Items in group */}
          <div className="border-t border-gray-100">
            {groupItems.map((item) => (
              <div
                key={item.id}
                className="px-6 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 cursor-pointer last:border-b-0"
              >
                <input
                  type="checkbox"
                  id={`stored-${item.id}`}
                  checked={item.isChecked}
                  onChange={() => onToggleCheck?.(item.idx)}
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer flex-shrink-0"
                />
                {item.tsType === 'meeting' ? (
                  <UsersIcon className="text-blue-600 h-6 w-6 flex-shrink-0" aria-label="meeting icon" />
                ) : (
                  <CheckIcon className="text-blue-600 h-6 w-6 flex-shrink-0" aria-label="task icon" />
                )}
                <label
                  htmlFor={`stored-${item.id}`}
                  className="text-sm text-gray-900 cursor-pointer flex-1 font-normal"
                >
                  {item.tsText || item.text}
                </label>
                <button
                  onClick={() => onDelete?.(item.id)}
                  className="text-red-400 hover:text-red-600 transition-colors duration-200 flex items-center gap-1 bg-transparent border-0 cursor-pointer px-2 py-1 rounded"
                  title="Delete item"
                >
                  <XMarkIcon className="h-6 w-6" aria-label="delete icon" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <section className="w-full mb-4">
      {/* Header with icon */}
      <div className="px-6 py-4 mb-4 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-900 m-0">Stored Items</h3>
      </div>
      
      {/* Groups */}
      {renderGroup('meeting', 'Meetings', <UsersIcon className="text-blue-600 h-6 w-6" aria-label="meetings icon" />, groups.meeting)}
      {renderGroup('tasks', 'Tasks', <CheckIcon className="text-blue-600 h-6 w-6" aria-label="tasks icon" />, groups.tasks)}
    </section>
  );
}

