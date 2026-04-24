import { Fragment } from 'react';
import { Icon } from '@iconify/react';

interface StepIndicatorProps {
  labels: string[];
  currentStep: number;
}

function StepIndicator({ labels, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-6 flex items-start">
      {labels.map((label, i) => {
        const stepIndex = i + 1;
        const isCompleted = currentStep > stepIndex;
        const isActive = currentStep === stepIndex;
        return (
          <Fragment key={stepIndex}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${
                  isCompleted
                    ? 'bg-primary text-white'
                    : isActive
                      ? 'bg-primary text-white ring-4 ring-primary/20'
                      : 'border-2 border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Icon aria-hidden="true" icon="lucide:check" width={14} />
                ) : (
                  stepIndex
                )}
              </div>
              <span
                className={`mt-1 text-xs ${
                  isActive ? 'font-medium text-primary' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className={`mx-2 mb-5 mt-4 h-0.5 flex-1 transition ${
                  isCompleted ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

export default StepIndicator;
