import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import useContactStore from '../store/useContactStore'
import ContactForm from './ContactForm'

describe('ContactForm', () => {
  beforeEach(() => {
    useContactStore.setState({
      createContact: vi.fn().mockResolvedValue(),
      updateContact: vi.fn().mockResolvedValue(),
    })
  })

  it('requires a first name before submit', async () => {
    render(<ContactForm onClose={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(screen.getByText('First name is required')).toBeInTheDocument()
    expect(useContactStore.getState().createContact).not.toHaveBeenCalled()
  })

  it('shows a client-side error for invalid email', async () => {
    render(<ContactForm onClose={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/first name/i), 'Asha')
    await userEvent.type(screen.getByLabelText(/^email$/i), 'asha')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    expect(useContactStore.getState().createContact).not.toHaveBeenCalled()
  })

  it('submits valid contact data and closes the form', async () => {
    const onClose = vi.fn()
    render(<ContactForm onClose={onClose} />)

    await userEvent.type(screen.getByLabelText(/first name/i), 'Asha')
    await userEvent.type(screen.getByLabelText(/^email$/i), 'asha@example.com')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(useContactStore.getState().createContact).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'Asha',
        email: 'asha@example.com',
      }),
    )
    expect(onClose).toHaveBeenCalled()
  })
})
