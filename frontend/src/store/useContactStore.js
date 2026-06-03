import { create } from 'zustand'

import * as api from '../api/contacts'

const useContactStore = create((set, get) => ({
  contacts: [],
  loading: false,
  error: null,
  query: '',

  setQuery: (query) => set({ query }),
  clearError: () => set({ error: null }),

  fetchContacts: async () => {
    set({ loading: true })
    try {
      const query = get().query.trim()
      const response = query ? await api.searchContacts(query) : await api.getContacts()
      set({ contacts: response.data, error: null })
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message })
    } finally {
      set({ loading: false })
    }
  },

  createContact: async (data) => {
    await api.createContact(data)
    await get().fetchContacts()
  },

  updateContact: async (id, data) => {
    await api.updateContact(id, data)
    await get().fetchContacts()
  },

  deleteContact: async (id) => {
    await api.deleteContact(id)
    await get().fetchContacts()
  },

  mergeContacts: async (sourceId, targetId) => {
    await api.mergeContacts({ source_id: sourceId, target_id: targetId })
    await get().fetchContacts()
  },
}))

export default useContactStore
