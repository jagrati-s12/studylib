
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-100 mb-5">
        <Icon className="w-8 h-8 text-surface-400" />
      </div>
      <h3 className="text-lg font-semibold text-surface-700 mb-1">{title}</h3>
      <p className="text-sm text-surface-500 max-w-md">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}



