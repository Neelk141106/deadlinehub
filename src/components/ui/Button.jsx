import React from 'react';

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  };

  const btnClass = variantClasses[variant] || variantClasses.primary;

  return (
    <button className={`${btnClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
