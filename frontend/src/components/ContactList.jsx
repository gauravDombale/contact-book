import { useState } from 'react'

import useContactStore from '../store/useContactStore'
import ConfirmDialog from './ConfirmDialog'
import ContactCard from './ContactCard'
import ContactForm from './ContactForm'
import MergeModal from './MergeModal'

export default function ContactList() {
  const { contacts, loading, error, deleteContact } = useContactStore()
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [merging, setMerging] = useState(null)

  if (loading) return <div className="py-16 text-center text-sm text-gray-400">Loading...</div>
  if (error) return <div className="py-16 text-center text-sm text-red-600">{error}</div>
  if (!contacts.length) {
    return <div className="py-16 text-center text-sm text-gray-400">No contacts found.</div>
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
