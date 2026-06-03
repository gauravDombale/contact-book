import { useEffect, useState } from 'react'
import { BookUser, Plus, Users } from 'lucide-react'

import ContactForm from '../components/ContactForm'
import ContactList from '../components/ContactList'
import SearchBar from '../components/SearchBar'
import useContactStore from '../store/useContactStore'

export default function Home() {
  const { fetchContacts, contacts } = useContactStore()
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2">
            <BookUser size={22} className="text-blue-600" />
            <span className="font-semibold tracking-tight text-gray-900">ContactBook</span>
          </div>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus size={15} />
            <span>New Contact</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar />
          <span className="whitespace-nowrap text-xs text-gray-400">
            <Users size={12} className="mr-1 inline" />
            {contacts.length} contacts
          </span>
        </div>
        <ContactList />
      </main>

      {adding && <ContactForm onClose={() => setAdding(false)} />}
    </div>
  )
}
