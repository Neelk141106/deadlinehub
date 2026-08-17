import React from 'react';

export function Input({ label, id, className = '', containerClassName = '', ...props }) {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="label-text">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`input-field ${className}`}
        {...props}
      />
    </div>
  );
}
