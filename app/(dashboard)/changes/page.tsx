export default function ChangesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Regulatory Changes</h1>
        <p className="text-gray-500 text-sm mt-1">
          Detected changes across monitored Florida regulatory sources
        </p>
      </div>

      {/* Filters — placeholder */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Empty state */}
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="text-4xl mb-3">🪵</div>
        <h2 className="text-lg font-medium text-gray-900 mb-1">No changes detected yet</h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Cedar is monitoring 10 Florida regulatory sources. Detected changes will appear here
          within 24 hours of publication.
        </p>
        <div className="mt-4 text-xs text-gray-400">
          Pipeline coming in Module 2 — MVP Phase
        </div>
      </div>
    </div>
  )
}
