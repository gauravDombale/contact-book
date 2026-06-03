import { useState } from 'react'
import { CheckCircle2, GitMerge, Info, X } from 'lucide-react'

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

function fullName(contact) {
  return [contact.first_name, contact.last_name].filter(Boolean).join(' ')
}

export default function MergeModal({ contact, onClose }) {
  const { contacts, mergeContacts } = useContactStore()
  const [targetId, setTargetId] = useState('')
  const [overrideFields, setOverrideFields] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const others = contacts.filter((candidate) => candidate.id !== contact.id)
  const target = contacts.find((candidate) => candidate.id === targetId)
  const additions = target
    ? MERGE_FIELDS.filter(([field]) => !target[field] && contact[field]).map(([field, label]) => ({
        field,
        label,
        value: contact[field],
      }))
    : []
  const conflicts = target
    ? MERGE_FIELDS.filter(
        ([field]) => target[field] && contact[field] && target[field] !== contact[field],
      ).map(([field, label]) => ({
        field,
        label,
        sourceValue: contact[field],
        targetValue: target[field],
      }))
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
        conflicts
          .filter((item) => overrideFields[item.field])
          .map((item) => [item.field, item.sourceValue]),
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
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitMerge size={18} className="text-blue-600" />
            <h2 className="font-semibold">Merge Duplicate</h2>
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

        <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-sm text-blue-900">
          <p className="font-medium">Choose the contact you want to keep.</p>
          <p className="mt-1 text-xs text-blue-700">
            This duplicate will be removed: {fullName(contact)}.
          </p>
        </div>

        <label htmlFor="merge-target" className="mb-1 block text-xs font-medium text-gray-500">
          Contact to keep
        </label>
        <select
          id="merge-target"
          value={targetId}
          onChange={(event) => {
            setTargetId(event.target.value)
            setOverrideFields({})
          }}
          disabled={!others.length}
          className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">
            {others.length ? 'Select contact to keep' : 'No other contacts available'}
          </option>
          {others.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {fullName(candidate)} {candidate.phone ? `(${candidate.phone})` : ''}
            </option>
          ))}
        </select>

        {target && (
          <div className="mb-4 rounded-lg border border-gray-200 p-3">
            <div className="mb-3 flex items-start gap-2">
              <Info size={16} className="mt-0.5 shrink-0 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {fullName(target)} will remain.
                </p>
                <p className="text-xs text-gray-500">
                  Existing details on this contact will not be overwritten.
                </p>
              </div>
            </div>

            {additions.length ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Details that will be added
                </p>
                {additions.map((item) => (
                  <div key={item.field} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                    <p className="min-w-0">
                      <span className="font-medium text-gray-700">{item.label}:</span>{' '}
                      <span className="break-words text-gray-600">{item.value}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                There are no empty fields to fill automatically.
              </p>
            )}

            {conflicts.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Different details
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  The kept contact wins by default. Select any duplicate details you want to use instead.
                </p>
                <div className="mt-3 space-y-2">
                  {conflicts.map((item) => (
                    <label
                      key={item.field}
                      className="flex items-start gap-2 rounded-lg border border-gray-100 p-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(overrideFields[item.field])}
                        onChange={() => toggleOverride(item.field)}
                        className="mt-1 h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="min-w-0">
                        <span className="block font-medium text-gray-700">
                          Use duplicate&apos;s {item.label.toLowerCase()}
                        </span>
                        <span className="block break-words text-xs text-gray-500">
                          Current: {item.targetValue}
                        </span>
                        <span className="block break-words text-xs text-gray-500">
                          Duplicate: {item.sourceValue}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
