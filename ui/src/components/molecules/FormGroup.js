/**
 * FormGroup - Molecule: Label + TextInput
 * Combines Label and TextInput atoms into a reusable form field
 */

import React from 'react';
import { Label } from '../atoms/Label';
import { TextInput } from '../atoms/TextInput';

/**
 * @param {Object} props
 * @param {string} props.label - Label text
 * @param {string} props.value - Input value
 * @param {Function} [props.onChange] - Change handler
 * @param {string} [props.placeholder=''] - Placeholder text
 * @param {boolean} [props.readOnly=false] - Read-only state
 * @param {boolean} [props.required=false] - Show required indicator
 * @param {string} [props.type='text'] - Input type: 'text' | 'textarea'
 */
export function FormGroup({
  label,
  value,
  onChange,
  placeholder = '',
  readOnly = false,
  required = false,
  type = 'text'
}) {
  return (
    <div className="mb-4">
      <Label htmlFor={label} required={required}>
        {label}
      </Label>
      <TextInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        type={type}
      />
    </div>
  );
}
