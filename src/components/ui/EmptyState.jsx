import React from 'react';

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-gray-300">
      {icon && <div className="text-gray-400 mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
