/**
 * DeleteIcon - Red X button for delete actions
 */

import React from 'react';
import { XMarkIcon } from '../../utils/IconMap';

/**
 * @param {Object} props
 * @param {string} [props.className=''] - Additional Tailwind classes
 * @param {string} [props.ariaLabel='delete'] - Accessibility label
 */
export function DeleteIcon({ className = '', ariaLabel = 'delete' }) {
  return (
    <XMarkIcon 
      className={`h-5 w-5 text-red-500 hover:text-red-700 ${className}`} 
      aria-label={ariaLabel} 
    />
  );
}
