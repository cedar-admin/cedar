const MVP_SOURCES = [
  { name: 'FDA Federal Register', method: 'Gov API', status: 'active' },
  { name: 'FDA Compounding Guidance', method: 'Oxylabs', status: 'active' },
  { name: 'DEA Diversion Control', method: 'Oxylabs', status: 'active' },
  { name: 'eCFR Title 21', method: 'Gov API', status: 'active' },
  { name: 'openFDA Drug Enforcement', method: 'Gov API', status: 'active' },
  { name: 'FL Dept of Health — MQA', method: 'Oxylabs', status: 'active' },
  { name: 'FL Board of Medicine', method: 'Oxylabs', status: 'active' },
  { name: 'FL Board of Pharmacy', method: 'Oxylabs', status: 'active' },
  { name: 'FL Administrative Register', method: 'Oxylabs', status: 'active' },
  { name: 'FL Board of Osteopathic Medicine', method: 'Oxylabs', status: 'active' },
]

export default function SourcesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Source Library</h1>
        <p className="text-gray-500 text-sm mt-1">
          {MVP_SOURCES.length} sources monitored — Florida regulatory coverage
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fetch Method
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tier
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Checked
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MVP_SOURCES.map((source) => (
              <tr key={source.name} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{source.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{source.method}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">
                    Critical
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                    Pending pipeline
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
