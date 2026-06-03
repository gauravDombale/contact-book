import axios from 'axios'

const api = axios.create({ baseURL: '/api/v1' })

export const getContacts = () => api.get('/contacts/')
export const searchContacts = (q) => api.get(`/contacts/search?q=${encodeURIComponent(q)}`)
export const createContact = (data) => api.post('/contacts/', data)
export const updateContact = (id, data) => api.put(`/contacts/${id}`, data)
export const deleteContact = (id) => api.delete(`/contacts/${id}`)
export const mergeContacts = (body) => api.post('/contacts/merge', body)
