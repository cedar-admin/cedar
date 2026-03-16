export default function AuditPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Audit Trail</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tamper-evident, timestamped record of all detected changes and acknowledgments
        </p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-sm">Audit trail will populate as changes are detected.</p>
      </div>
    </div>
  )
}
