/**
 * AutomaticTab - Template: Git URLs tab layout (Ant Design style)
 * Orchestrates git workflow: URL list management, history checking, results display
 */

import React from 'react';
import { ResultSection } from '../organisms/ResultSection';

/**
 * @param {Object} props
 * @param {Array} props.gitUrls - Git URL items array
 * @param {Function} props.onUrlChange - URL changed handler (id, url)
 * @param {Function} props.onAddUrl - Add URL button handler
 * @param {Function} props.onDeleteUrl - Delete URL handler (id)
 * @param {Function} props.onCheckHistory - Check Git History button handler
 * @param {string} props.gitResult - Git analysis result text
 * @param {boolean} props.loading - Loading state
 */
export function AutomaticTab({
  gitUrls,
  onUrlChange,
  onAddUrl,
  onDeleteUrl,
  onCheckHistory,
  gitResult,
  loading
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Git URLs Section */}
      <section style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Header with icon */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ color: '#1677ff', fontSize: '20px' }}>git_branch</span>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(0, 0, 0, 0.88)', margin: 0 }}>
            Git URLs ({gitUrls.length})
          </h3>
        </div>

        {/* URL inputs */}
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {gitUrls.map((item, index) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="text"
                value={item.url}
                onChange={(e) => onUrlChange(item.id, e.target.value)}
                placeholder="https://github.com/user/repo.git"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
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
              <button
                onClick={() => onDeleteUrl(item.id)}
                style={{
                  color: '#8c8c8c',
                  fontSize: '14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#ff4d4f'}
                onMouseLeave={(e) => e.target.style.color = '#8c8c8c'}
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add More button */}
          <button
            onClick={onAddUrl}
            style={{
              marginTop: '8px',
              color: '#1677ff',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#4096ff'}
            onMouseLeave={(e) => e.target.style.color = '#1677ff'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
            Add URL
          </button>
        </div>
      </section>

      {/* Check History button */}
      <button
        onClick={onCheckHistory}
        disabled={loading || gitUrls.every(url => !url.url.trim())}
        style={{
          width: '100%',
          height: '40px',
          backgroundColor: loading || gitUrls.every(url => !url.url.trim()) ? '#d9d9d9' : '#262626',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: loading || gitUrls.every(url => !url.url.trim()) ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!loading && gitUrls.some(url => url.url.trim())) {
            e.target.style.backgroundColor = '#434343';
            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.12)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && gitUrls.some(url => url.url.trim())) {
            e.target.style.backgroundColor = '#262626';
            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)';
          }
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>git_branch</span>
        {loading ? 'Checking...' : 'Check Git History'}
      </button>

      {/* Result section */}
      {gitResult && (
        <ResultSection
          title="Git History"
          content={gitResult}
        />
      )}
    </div>
  );
}
