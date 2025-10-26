import React from 'react';
import { Spinner } from '@nextui-org/react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-4 ${className}`}
    >
      <Spinner size={size} />
      {label && (
        <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>{label}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
