import { useState } from 'react'
import { Users } from 'lucide-react'

import useContactStore from '../store/useContactStore'
import ConfirmDialog from './ConfirmDialog'
import ContactCard from './ContactCard'
import ContactForm from './ContactForm'
import MergeModal from './MergeModal'

/* Animated skeleton placeholder that mirrors the shape of a ContactCard */
function SkeletonCard() {
  return (
    <div className="flex min-h-32 animate-pulse items-start gap-3 rounded-lg border border-gray-100 bg-white p-4">
      <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 w-2/3 rounded bg-gray-200" />
        <div className="h-2.5 w-1/2 rounded bg-gray-100" />
        <div className="h-2.5 w-3/5 rounded bg-gray-100" />
      </div>
    </div>
  )
}

/* Rich empty state with icon + call-to-action */
function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <Users size={28} className="text-blue-400" />
      </div>
      <p className="mb-1 text-sm font-medium text-gray-700">No contacts yet</p>
      <p className="mb-5 text-xs text-gray-400">
        Add your first contact to get started.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        + New Contact
      </button>
    </div>
  )
}

export default function ContactList({ onAdd }) {
  const { contacts, loading, deleteContact } = useContactStore()
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [merging, setMerging] = useState(null)

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!contacts.length) {
    return <EmptyState onAdd={onAdd} />
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onEdit={setEditing}
            onDelete={setDeleting}
            onMerge={setMerging}
          />
        ))}
      </div>

      {editing && <ContactForm contact={editing} onClose={() => setEditing(null)} />}
      {merging && <MergeModal contact={merging} onClose={() => setMerging(null)} />}
      {deleting && (
        <ConfirmDialog
          message={`Delete "${deleting.first_name} ${deleting.last_name}"? This cannot be undone.`}
          onConfirm={async () => {
            await deleteContact(deleting.id)
            setDeleting(null)
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
