import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon: Icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      {Icon && (
        <div className='mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800'>
          <Icon className='h-8 w-8 text-gray-400' />
        </div>
      )}
      <h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-white'>
        {message}
      </h3>
      {action && <div className='mt-4'>{action}</div>}
    </div>
  );
};

export default EmptyState;
