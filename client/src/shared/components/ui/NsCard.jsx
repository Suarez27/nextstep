import React from 'react';

export default function NsCard({
  children,
  className = '',
  padding = 'p-5',
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${padding} ${className}`}>
      {children}
    </div>
  );
}
