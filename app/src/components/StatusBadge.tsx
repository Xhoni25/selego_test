import React from 'react';
import { Chip } from '@nextui-org/react';
import { ExpenseStatus } from '../types';

interface StatusBadgeProps {
  status: ExpenseStatus;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  size = 'sm',
}) => {
  const getStatusConfig = (status: ExpenseStatus) => {
    switch (status) {
      case 'pending':
        return {
          color: 'warning' as const,
          variant: 'flat' as const,
          text: 'Pending',
        };
      case 'approved':
        return {
          color: 'success' as const,
          variant: 'flat' as const,
          text: 'Approved',
        };
      case 'rejected':
        return {
          color: 'danger' as const,
          variant: 'flat' as const,
          text: 'Rejected',
        };
      default:
        return {
          color: 'default' as const,
          variant: 'flat' as const,
          text: status,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip color={config.color} variant={config.variant} size={size}>
      {children || config.text}
    </Chip>
  );
};

export default StatusBadge;
