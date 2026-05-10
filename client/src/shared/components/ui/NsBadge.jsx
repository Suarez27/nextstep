import React from 'react';

const types = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  brand: 'bg-brand-100 text-brand-800 border-brand-200',
};

export default function NsBadge({
  children,
  type = 'default',
  className = '',
}) {
  const colorClass = types[type] || types.default;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}>
      {children}
    </span>
  );
}
