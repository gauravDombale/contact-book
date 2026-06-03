import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

import useContactStore from '../store/useContactStore'

export default function SearchBar() {
  const { query, setQuery, fetchContacts } = useContactStore()
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleChange = (event) => {
    setQuery(event.target.value)
    clearTimeout(timer.current)
    timer.current = setTimeout(fetchContacts, 300)
  }

  const clear = () => {
    setQuery('')
    clearTimeout(timer.current)
    timer.current = setTimeout(fetchContacts, 0)
  }

  return (
    <div className="relative flex w-full max-w-lg items-center">
      <Search size={16} className="absolute left-3 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search name, phone, or email..."
        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {query && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
