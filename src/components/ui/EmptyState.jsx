import React from 'react';

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-[#151C2C] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm transition-colors duration-200">
      {icon && <div className="text-slate-400 dark:text-slate-500 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
