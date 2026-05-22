/**
 * TabNav - Organism: Tab navigation bar
 * Manages active tab state and renders tab buttons
 */

import React from 'react';
import { TabButton } from '../molecules/TabButton';

/**
 * @param {Object} props
 * @param {string[]} [props.tabs=[]] - Array of tab names
 * @param {string} props.activeTab - Currently active tab name
 * @param {Function} props.onTabChange - Handler called with tab name when clicked
 * @param {string} [props.className=''] - Additional Tailwind classes
 */
export function TabNav({ tabs = [], activeTab, onTabChange, className = '' }) {
  return (
    <div className={`border-b border-gray-200 mb-6 ${className}`}>
      <div className="flex gap-4">
        {tabs.map((tab) => (
          <TabButton
            key={tab}
            label={tab}
            isActive={activeTab === tab}
            onClick={() => onTabChange(tab)}
          />
        ))}
      </div>
    </div>
  );
}
