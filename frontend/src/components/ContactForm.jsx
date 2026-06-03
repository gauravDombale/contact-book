import { useState } from 'react'
import { X } from 'lucide-react'

import useContactStore from '../store/useContactStore'

const EMPTY = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  company: '',
  notes: '',
}

export default function ContactForm({ contact, onClose }) {
  const [form, setForm] = useState(contact ? { ...EMPTY, ...contact } : { ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { createContact, updateContact } = useContactStore()

  const handle = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    if (!form.first_name.trim()) {
      setError('First name is required')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key)),
      )
      contact ? await updateContact(contact.id, payload) : await createContact(payload)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ name, label, type = 'text' }) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      <input
        name={name}
        type={type}
        value={form[name] || ''}
        onChange={handle}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{contact ? 'Edit Contact' : 'New Contact'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close contact form"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field name="first_name" label="First Name *" />
          <Field name="last_name" label="Last Name" />
          <Field name="email" label="Email" type="email" />
          <Field name="phone" label="Phone" />
          <Field name="company" label="Company" />
          <Field name="address" label="Address" />
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-gray-500">Notes</label>
          <textarea
            name="notes"
            value={form.notes || ''}
            onChange={handle}
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : contact ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
