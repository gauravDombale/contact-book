import { Building2, GitMerge, Mail, Pencil, Phone, Trash2 } from 'lucide-react'

export default function ContactCard({ contact, onEdit, onDelete, onMerge }) {
  const initials = [contact.first_name[0], contact.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase()
  const hue = (contact.first_name.charCodeAt(0) * 17) % 360

  return (
    <article className="group flex min-h-32 items-start gap-3 rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-sm">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ background: `hsl(${hue}, 55%, 50%)` }}
      >
        {initials || '?'}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">
          {contact.first_name} {contact.last_name}
        </p>
        {contact.company && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-400">
            <Building2 size={11} />
            {contact.company}
          </p>
        )}
        {contact.email && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
            <Mail size={11} />
            {contact.email}
          </p>
        )}
        {contact.phone && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
            <Phone size={11} />
            {contact.phone}
          </p>
        )}
      </div>

      <div className="flex shrink-0 gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(contact)}
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
          aria-label="Edit contact"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={() => onMerge(contact)}
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
          aria-label="Merge contact"
        >
          <GitMerge size={14} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(contact)}
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
          aria-label="Delete contact"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  )
}
