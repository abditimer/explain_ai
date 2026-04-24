import { useState, useCallback } from 'react';
import { useScrollama } from '../../hooks/useScrollama';

export function Scrolly({ children, stepSelector = '.step', offset = 0.5, onStepChange }) {
  const [currentStep, setCurrentStep] = useState(0);

  const onStepEnter = useCallback(({ index }) => {
    setCurrentStep(index);
    onStepChange?.(index);
  }, [onStepChange]);

  useScrollama({ step: stepSelector, offset, onStepEnter });

  return children(currentStep);
}
