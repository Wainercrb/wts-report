/**
 * Button - Atomic component for all button actions
 * Variants: primary (blue), secondary (gray), danger (red), disabled
 * Sizes: sm, md, lg
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content/label
 * @param {string} [props.variant='primary'] - Button style: 'primary' | 'secondary' | 'danger' | 'disabled'
 * @param {string} [props.size='md'] - Button size: 'sm' | 'md' | 'lg'
 * @param {Function} [props.onClick] - Click handler
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.fullWidth=false] - Stretch to container width
 * @param {boolean} [props.loading=false] - Loading state (shows disabled)
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  fullWidth = false,
  loading = false
}) {
  const baseClasses = 'rounded-md font-semibold transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-300 text-gray-800 hover:bg-gray-400',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    disabled: 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-50'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base font-semibold',
    lg: 'px-6 py-4 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
