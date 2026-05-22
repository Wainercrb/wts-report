/**
 * Badge - Atomic badge for status/tags
 * Variants: info, success, warning, error
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - Badge text/content
 * @param {string} [props.variant='info'] - Badge color variant: 'info' | 'success' | 'warning' | 'error'
 * @param {string} [props.className=''] - Additional Tailwind classes
 */
export function Badge({ children, variant = 'info', className = '' }) {
  const variantClasses = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
