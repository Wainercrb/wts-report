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
      <section className="w-full" style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '24px', marginBottom: '16px' }}>
        {/* 1. Sub-tabs: Meeting/Tasks segmented control */}
        <div className="mb-6" style={{ marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.04)', padding: '2px', borderRadius: '8px', display: 'flex', position: 'relative' }}>
            <button
              onClick={() => onTypeChange('meeting')}
              className="flex-1 transition-all duration-200"
              style={{
                flex: 1,
                padding: '6px 12px',
                textAlign: 'center',
                fontSize: '14px',
                position: 'relative',
                zIndex: 10,
                color: currentItem.tsType === 'meeting' ? 'rgba(0, 0, 0, 0.88)' : 'rgba(0, 0, 0, 0.45)',
                fontWeight: '500',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Meeting
            </button>
            <button
              onClick={() => onTypeChange('tasks')}
              className="flex-1 transition-all duration-200"
              style={{
                flex: 1,
                padding: '6px 12px',
                textAlign: 'center',
                fontSize: '14px',
                position: 'relative',
                zIndex: 10,
                color: currentItem.tsType === 'tasks' ? 'rgba(0, 0, 0, 0.88)' : 'rgba(0, 0, 0, 0.45)',
                fontWeight: '500',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Tasks
            </button>
            {/* Sliding background indicator */}
            <div
              style={{
                position: 'absolute',
                top: '2px',
                left: '2px',
                bottom: '2px',
                width: 'calc(50% - 2px)',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                borderRadius: '6px',
                transition: 'transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
                transform: currentItem.tsType === 'meeting' ? 'translateX(0)' : 'translateX(100%)'
              }}
            ></div>
          </div>
        </div>

        {/* 2. Header: Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', color: 'rgba(0, 0, 0, 0.88)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', margin: 0 }}>
            <span className="material-symbols-outlined" style={{ color: '#1677ff', fontSize: '20px' }}>
              {typeIcon}
            </span>
            <span>{typeLabel}</span>
          </h2>
        </div>

        {/* 3. Textarea input */}
        <div style={{ marginBottom: '16px' }}>
          <textarea
            value={currentItem.tsText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Type task summaries or participant details here..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              fontSize: '14px',
              lineHeight: '1.5714',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontFamily: "'Inter', sans-serif",
              color: 'rgba(0, 0, 0, 0.88)',
              boxSizing: 'border-box',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4096ff';
              e.target.style.boxShadow = '0 0 0 2px rgba(5, 145, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d9d9d9';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* 4. Back/Next buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
          <button
            onClick={onBack}
            disabled={loading || addedItems.length === 0}
            style={{
              flex: 1,
              height: '32px',
              borderRadius: '6px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              backgroundColor: '#fff',
              border: '1px solid #d9d9d9',
              boxShadow: '0 2px 0 rgba(0, 0, 0, 0.02)',
              cursor: (loading || addedItems.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (loading || addedItems.length === 0) ? 0.5 : 1,
              color: 'rgba(0, 0, 0, 0.88)',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => !(loading || addedItems.length === 0) && (e.target.style.color = '#1677ff', e.target.style.borderColor = '#1677ff')}
            onMouseLeave={(e) => !(loading || addedItems.length === 0) && (e.target.style.color = 'rgba(0, 0, 0, 0.88)', e.target.style.borderColor = '#d9d9d9')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
            Back
          </button>
          <button
            onClick={onNext}
            disabled={loading}
            style={{
              flex: 1,
              height: '32px',
              borderRadius: '6px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              backgroundColor: '#1677ff',
              border: 'none',
              boxShadow: '0 2px 0 rgba(5, 145, 255, 0.1)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              color: '#fff',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#4096ff')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#1677ff')}
          >
            Next
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
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
      <div style={{ marginTop: '16px', marginBottom: '24px' }}>
        <button
          onClick={onFinish}
          disabled={loading || (addedItems.length === 0 && checkedStoredItems.size === 0)}
          style={{
            width: '100%',
            height: '40px',
            borderRadius: '6px',
            backgroundColor: '#262626',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: 'none',
            cursor: (loading || (addedItems.length === 0 && checkedStoredItems.size === 0)) ? 'not-allowed' : 'pointer',
            opacity: (loading || (addedItems.length === 0 && checkedStoredItems.size === 0)) ? 0.5 : 1,
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)'
          }}
          onMouseEnter={(e) => !(loading || (addedItems.length === 0 && checkedStoredItems.size === 0)) && (e.target.style.backgroundColor = '#434343')}
          onMouseLeave={(e) => !(loading || (addedItems.length === 0 && checkedStoredItems.size === 0)) && (e.target.style.backgroundColor = '#262626')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
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
