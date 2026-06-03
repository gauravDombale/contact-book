import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import useContactStore from '../store/useContactStore'
import ContactList from './ContactList'

describe('ContactList', () => {
  beforeEach(() => {
    useContactStore.setState({
      contacts: [],
      loading: false,
      error: null,
      deleteContact: vi.fn().mockResolvedValue(),
    })
  })

  it('renders skeleton cards while contacts are loading', () => {
    useContactStore.setState({ loading: true })

    const { container } = render(<ContactList onAdd={vi.fn()} />)

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(6)
  })

  it('shows a useful empty state and calls onAdd', async () => {
    const onAdd = vi.fn()
    render(<ContactList onAdd={onAdd} />)

    expect(screen.getByText('No contacts yet')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /\+ new contact/i }))

    expect(onAdd).toHaveBeenCalled()
  })
})
