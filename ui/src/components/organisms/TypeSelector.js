/**
 * TypeSelector - Organism: Meeting/Tasks type selector
 * Displays two buttons for selecting type, wraps in FormCard
 */

import React from 'react';
import { FormCard } from './FormCard';
import { Button } from '../atoms/Button';

/**
 * @param {Object} props
 * @param {string} props.value - Current type: 'meeting' | 'tasks'
 * @param {Function} props.onChange - Handler called with type string
 * @param {string} [props.className=''] - Additional Tailwind classes
 */
export function TypeSelector({ value, onChange, className = '' }) {
  const types = ['meeting', 'tasks'];

  return (
    <FormCard title="Type" className={className}>
      <div className="flex gap-3">
        {types.map((type) => (
          <Button
            key={type}
            variant={value === type ? 'primary' : 'secondary'}
            onClick={() => onChange(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>
    </FormCard>
  );
}
