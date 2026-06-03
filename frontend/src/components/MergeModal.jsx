import { useState } from 'react'
import { GitMerge, X } from 'lucide-react'

import useContactStore from '../store/useContactStore'

export default function MergeModal({ contact, onClose }) {
  const { contacts, mergeContacts } = useContactStore()
  const [targetId, setTargetId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const others = contacts.filter((candidate) => candidate.id !== contact.id)

  const doMerge = async () => {
    if (!targetId) return
    setSaving(true)
    setError('')
    try {
      await mergeContacts(contact.id, targetId)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Merge failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitMerge size={18} className="text-blue-600" />
            <h2 className="font-semibold">Merge Contact</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close merge dialog"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mb-3 text-sm text-gray-500">
          Merging{' '}
          <span className="font-medium text-gray-900">
            {contact.first_name} {contact.last_name}
          </span>{' '}
          into:
        </p>

        <select
          value={targetId}
          onChange={(event) => setTargetId(event.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select target contact</option>
          {others.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.first_name} {candidate.last_name}{' '}
              {candidate.email ? `(${candidate.email})` : ''}
            </option>
          ))}
        </select>

        <p className="mb-4 text-xs text-gray-400">
          Source contact will be deleted. Empty fields in target will be filled from source.
        </p>

        {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={doMerge}
            disabled={!targetId || saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Merging...' : 'Merge'}
          </button>
        </div>
      </div>
    </div>
  )
}
