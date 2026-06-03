import { useState } from 'react'
import { ArrowRight, GitMerge, X } from 'lucide-react'

import useContactStore from '../store/useContactStore'

const MERGE_FIELDS = [
  ['first_name', 'First name'],
  ['last_name', 'Last name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['company', 'Company'],
  ['address', 'Address'],
  ['notes', 'Notes'],
]

function display(value) {
  return value || 'Empty'
}

export default function MergeModal({ contact, onClose }) {
  const { contacts, mergeContacts } = useContactStore()
  const [targetId, setTargetId] = useState('')
  const [overrideFields, setOverrideFields] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const others = contacts.filter((candidate) => candidate.id !== contact.id)
  const target = contacts.find((candidate) => candidate.id === targetId)

  const previewRows = target
    ? MERGE_FIELDS.map(([field, label]) => {
        const sourceValue = contact[field]
        const targetValue = target[field]
        const hasConflict = Boolean(sourceValue && targetValue && sourceValue !== targetValue)
        const useSource = Boolean(overrideFields[field])
        const finalValue = useSource || (!targetValue && sourceValue) ? sourceValue : targetValue

        return { field, label, sourceValue, targetValue, finalValue, hasConflict, useSource }
      })
    : []

  const toggleOverride = (field) => {
    setOverrideFields((current) => ({ ...current, [field]: !current[field] }))
  }

  const doMerge = async () => {
    if (!targetId) return
    setSaving(true)
    setError('')
    try {
      const overrides = Object.fromEntries(
        previewRows
          .filter((row) => row.useSource)
          .map((row) => [row.field, row.sourceValue]),
      )
      await mergeContacts(contact.id, targetId, Object.keys(overrides).length ? overrides : null)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Merge failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
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
          Merge duplicate source contact{' '}
          <span className="font-medium text-gray-900">
            {contact.first_name} {contact.last_name}
          </span>{' '}
          into the target contact that should remain.
        </p>

        <select
          value={targetId}
          onChange={(event) => {
            setTargetId(event.target.value)
            setOverrideFields({})
          }}
          disabled={!others.length}
          className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">
            {others.length ? 'Select target contact' : 'No other contacts available'}
          </option>
          {others.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.first_name} {candidate.last_name}{' '}
              {candidate.email ? `(${candidate.email})` : ''}
            </option>
          ))}
        </select>

        {target && (
          <div className="mb-4 overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-[1fr_1fr_1fr] gap-0 border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              <span>Source</span>
              <span>Target</span>
              <span>Final</span>
            </div>
            <div className="divide-y divide-gray-100">
              {previewRows.map((row) => (
                <div key={row.field} className="grid grid-cols-[1fr_1fr_1fr] gap-0 px-3 py-3 text-xs">
                  <div className="min-w-0 pr-3">
                    <p className="mb-1 font-medium text-gray-500">{row.label}</p>
                    <p className={row.sourceValue ? 'break-words text-gray-800' : 'text-gray-400'}>
                      {display(row.sourceValue)}
                    </p>
                  </div>
                  <div className="min-w-0 border-l border-gray-100 px-3">
                    <p className="mb-1 font-medium text-gray-500">{row.label}</p>
                    <p className={row.targetValue ? 'break-words text-gray-800' : 'text-gray-400'}>
                      {display(row.targetValue)}
                    </p>
                  </div>
                  <div className="min-w-0 border-l border-gray-100 pl-3">
                    <div className="mb-1 flex items-center gap-1 font-medium text-gray-500">
                      <ArrowRight size={12} />
                      <span>{row.label}</span>
                    </div>
                    <p className={row.finalValue ? 'break-words text-gray-900' : 'text-gray-400'}>
                      {display(row.finalValue)}
                    </p>
                    {row.hasConflict && (
                      <label className="mt-2 flex items-center gap-2 text-[11px] text-blue-700">
                        <input
                          type="checkbox"
                          checked={row.useSource}
                          onChange={() => toggleOverride(row.field)}
                          className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Use source value
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mb-4 text-xs text-gray-400">
          The source contact will be deleted after merge. Target values are kept unless the
          target field is empty or you choose a source value for a conflict.
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
            disabled={!targetId || saving || !others.length}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Merging...' : 'Merge'}
          </button>
        </div>
      </div>
    </div>
  )
}
