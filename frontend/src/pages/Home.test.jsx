import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import useContactStore from '../store/useContactStore'
import Home from './Home'

describe('Home', () => {
  beforeEach(() => {
    useContactStore.setState({
      contacts: [],
      loading: false,
      error: 'API unavailable',
      fetchContacts: vi.fn(),
      clearError: vi.fn(() => useContactStore.setState({ error: null })),
    })
  })

  it('surfaces and dismisses API errors', async () => {
    render(<Home />)

    expect(screen.getByRole('alert')).toHaveTextContent('API unavailable')

    await userEvent.click(screen.getByRole('button', { name: /dismiss error/i }))

    expect(useContactStore.getState().clearError).toHaveBeenCalled()
  })
})
