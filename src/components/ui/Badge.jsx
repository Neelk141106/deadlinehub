import React from 'react';

export function Badge({ children, variant = 'normal', className = '', ...props }) {
  const variantClasses = {
    urgent: 'badge-urgent',
    approaching: 'badge-approaching',
    normal: 'badge-normal',
    past: 'badge-past',
  };

  const badgeClass = variantClasses[variant] || variantClasses.normal;

  return (
    <span className={`${badgeClass} ${className}`} {...props}>
      {children}
    </span>
  );
}
