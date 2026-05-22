/**
 * ManualTab - Template: Form entry tab layout (Ant Design + Stitch Style)
 * Orchestrates form workflow with Material Symbols icons and Ant Design styling
 */

import React from 'react';
import { StoredItems } from '../organisms/StoredItems';
import { AddedItems } from '../organisms/AddedItems';
import { ResultSection } from '../organisms/ResultSection';

/**
 * @param {Object} props
 * @param {Object} props.currentItem - Current item being edited {tsType, tsText}
 * @param {Function} props.onTypeChange - Type changed handler
 * @param {Function} props.onTextChange - Text changed handler
 * @param {Function} props.onNext - Next button handler
 * @param {Function} props.onBack - Back button handler
 * @param {Function} props.onFinish - Finish button handler
 * @param {string} props.result - LLM result text
 * @param {boolean} props.loading - Loading state
 * @param {Array} props.addedItems - Items added but not yet saved
 * @param {Function} props.onSaveAddedItem - Handler to save an added item
 * @param {Array} props.storedItems - Items saved to storage
 * @param {Set} props.checkedStoredItems - Set of checked stored item indices
 * @param {Function} props.onToggleCheck - Handler to toggle stored item check
 * @param {Function} props.onDeleteStoredItem - Handler to delete a stored item
 */
export function ManualTab({
  currentItem,
  onTypeChange,
  onTextChange,
  onNext,
  onBack,
  onFinish,
  result,
  loading,
  addedItems = [],
  onSaveAddedItem,
  storedItems = [],
  checkedStoredItems,
  onToggleCheck,
  onDeleteStoredItem
}) {
  const typeLabel = currentItem.tsType === 'meeting' ? 'Meeting' : 'Tasks';
  const typeIcon = currentItem.tsType === 'meeting' ? 'groups' : 'task_alt';

  // Transform stored items for display
  const displayStoredItems = storedItems.map((item, idx) => ({
    id: item.id,
    idx,
    text: item.tsText,
    isChecked: checkedStoredItems.has(idx)
  }));

  // Transform added items for display
  const displayAddedItems = addedItems.map(item => ({
    id: item.id,
    text: item.tsText
  }));

  return (
    <>
      <section className="w-full bg-white border border-gray-100 rounded-lg p-6 mb-4">
        {/* 1. Sub-tabs: Meeting/Tasks segmented control */}
        <div className="mb-6">
          <div className="bg-gray-100 p-0.5 rounded-lg flex relative">
            <button
              onClick={() => onTypeChange('meeting')}
              className={`flex-1 px-3 py-1.5 text-center text-sm font-medium cursor-pointer bg-transparent border-0 relative z-10 transition-all ${
                currentItem.tsType === 'meeting'
                  ? 'text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              Meeting
            </button>
            <button
              onClick={() => onTypeChange('tasks')}
              className={`flex-1 px-3 py-1.5 text-center text-sm font-medium cursor-pointer bg-transparent border-0 relative z-10 transition-all ${
                currentItem.tsType === 'tasks'
                  ? 'text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              Tasks
            </button>
            {/* Sliding background indicator */}
            <div
              className={`absolute top-0.5 bottom-0.5 left-0.5 right-auto w-[calc(50%-2px)] bg-white rounded shadow-sm transition-transform duration-300 ${
                currentItem.tsType === 'meeting'
                  ? 'translate-x-0'
                  : 'translate-x-[100%]'
              }`}
            ></div>
          </div>
        </div>

        {/* 2. Header: Icon + Title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base text-gray-900 flex items-center gap-2 font-semibold m-0">
            <span className="material-symbols-outlined text-blue-600 text-xl">
              {typeIcon}
            </span>
            <span>{typeLabel}</span>
          </h2>
        </div>

        {/* 3. Textarea input */}
        <div className="mb-4">
          <textarea
            value={currentItem.tsText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Type task summaries or participant details here..."
            className="w-full min-h-[120px] px-3 py-2 text-sm border border-gray-300 rounded focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all leading-relaxed font-['Inter',sans-serif] text-gray-900"
          />
        </div>

        {/* 4. Back/Next buttons */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={onBack}
            disabled={loading || addedItems.length === 0}
            className="flex-1 h-8 rounded px-3 py-2 text-sm font-medium flex items-center justify-center gap-1 bg-white border border-gray-300 text-gray-900 cursor-pointer hover:text-blue-600 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span className="material-symbols-outlined text-base">chevron_left</span>
            Back
          </button>
          <button
            onClick={onNext}
            disabled={loading}
            className="flex-1 h-8 rounded px-3 py-2 text-sm font-medium flex items-center justify-center gap-1 bg-blue-600 border-0 text-white cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
      </section>

      {/* 5. Added Items section - items added but not yet saved */}
      {displayAddedItems.length > 0 && (
        <AddedItems items={displayAddedItems} onSave={onSaveAddedItem} />
      )}

      {/* 6. Stored Items section - items saved to storage */}
      {displayStoredItems.length > 0 && (
        <StoredItems items={displayStoredItems} onToggleCheck={onToggleCheck} onDelete={onDeleteStoredItem} />
      )}

      {/* 7. Finish button */}
      <div className="mt-4 mb-6">
        <button
          onClick={onFinish}
          disabled={loading || (addedItems.length === 0 && checkedStoredItems.size === 0)}
          className="w-full h-10 rounded px-3 py-2 text-sm font-medium flex items-center justify-center gap-2 bg-gray-900 text-white cursor-pointer hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">check_circle</span>
          Finish
        </button>
      </div>

      {/* 8. Result Summary */}
      {result && (
        <ResultSection
          title="Result Summary"
          content={result}
        />
      )}
    </>
  );
}
