/**
 * InputFieldWithDelete - Molecule: TextInput + DeleteIcon
 * Used for lists of dynamic inputs with delete buttons (e.g., git URLs)
 */

import React from 'react';
import { TextInput } from '../atoms/TextInput';
import { DeleteIcon } from '../atoms/DeleteIcon';

/**
 * @param {Object} props
 * @param {string} props.value - Input value
 * @param {Function} [props.onChange] - Change handler receives value string
 * @param {Function} [props.onDelete] - Delete handler
 * @param {string} [props.placeholder=''] - Placeholder text
 * @param {string} [props.className=''] - Additional Tailwind classes
 */
export function InputFieldWithDelete({
  value,
  onChange,
  onDelete,
  placeholder = '',
  className = ''
}) {
  return (
    <div className={`flex items-center gap-2 mb-3 ${className}`}>
      <TextInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1"
      />
      <DeleteIcon onClick={onDelete} />
    </div>
  );
}
