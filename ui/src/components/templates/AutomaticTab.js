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
    <div className="flex flex-col gap-4">
      {/* Git URLs Section */}
      <section className="w-full bg-white border border-gray-100 rounded-lg overflow-hidden">
        {/* Header with icon */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-xl">git_branch</span>
          <h3 className="text-sm font-semibold text-gray-900 m-0">
            Git URLs ({gitUrls.length})
          </h3>
        </div>

        {/* URL inputs */}
        <div className="px-6 py-4 flex flex-col gap-3">
          {gitUrls.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3">
              <input
                type="text"
                value={item.url}
                onChange={(e) => onUrlChange(item.id, e.target.value)}
                placeholder="https://github.com/user/repo.git"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              />
              <button
                onClick={() => onDeleteUrl(item.id)}
                className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer text-sm font-medium bg-transparent border-0 px-2 py-1"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add More button */}
          <button
            onClick={onAddUrl}
            className="mt-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer text-sm font-medium flex items-center gap-1.5 bg-transparent border-0 p-1"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            Add URL
          </button>
        </div>
      </section>

      {/* Check History button */}
      <button
        onClick={onCheckHistory}
        disabled={loading || gitUrls.every(url => !url.url.trim())}
        className={`w-full h-10 flex items-center justify-center gap-2 text-sm font-medium rounded transition-all ${
          loading || gitUrls.every(url => !url.url.trim())
            ? 'bg-gray-300 text-white cursor-not-allowed'
            : 'bg-gray-900 text-white cursor-pointer hover:bg-gray-800 hover:shadow-md'
        }`}
      >
        <span className="material-symbols-outlined text-lg">git_branch</span>
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
