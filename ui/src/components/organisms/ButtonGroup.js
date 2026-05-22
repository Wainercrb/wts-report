/**
 * ButtonGroup - Organism: Navigation footer (Back, Next, Finish)
 * Displays form navigation buttons with intelligent layout
 */

import React from 'react';
import { Button } from '../atoms/Button';

/**
 * @param {Object} props
 * @param {Function} props.onBack - Back button handler
 * @param {Function} props.onNext - Next button handler
 * @param {Function} props.onFinish - Finish button handler
 * @param {boolean} [props.isLastStep=false] - If true, hides Next button
 * @param {boolean} [props.loading=false] - Loading state (disables all buttons)
 * @param {string} [props.className=''] - Additional Tailwind classes
 */
export function ButtonGroup({
  onBack,
  onNext,
  onFinish,
  isLastStep = false,
  loading = false,
  className = ''
}) {
  return (
    <div className={`flex gap-3 mt-6 ${className}`}>
      <Button
        variant="secondary"
        onClick={onBack}
        disabled={loading}
        size="sm"
      >
        ← Back
      </Button>
      {!isLastStep && (
        <Button
          variant="primary"
          onClick={onNext}
          disabled={loading}
          size="sm"
        >
          Next →
        </Button>
      )}
    </div>
  );
}
