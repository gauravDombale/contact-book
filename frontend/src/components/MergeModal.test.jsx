import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import useContactStore from '../store/useContactStore'
import MergeModal from './MergeModal'

const source = {
  id: 'source-1',
  first_name: 'Amit',
  last_name: 'Sharma',
  email: 'source@example.com',
  phone: '111',
  company: '',
  address: '',
  notes: '',
}

const target = {
  id: 'target-1',
  first_name: 'Amit',
  last_name: 'Sharma',
  email: 'target@example.com',
  phone: '222',
  company: '',
  address: '',
  notes: '',
}

describe('MergeModal', () => {
  beforeEach(() => {
    useContactStore.setState({
      contacts: [source, target],
      mergeContacts: vi.fn().mockResolvedValue(),
    })
  })

  it('previews merge conflicts and submits selected overrides', async () => {
    const onClose = vi.fn()
    render(<MergeModal contact={source} onClose={onClose} />)

    await userEvent.selectOptions(screen.getByRole('combobox'), target.id)

    expect(screen.getByText('source@example.com')).toBeInTheDocument()
    expect(screen.getAllByText('target@example.com').length).toBeGreaterThan(0)

    await userEvent.click(screen.getAllByLabelText(/use source value/i)[0])
    await userEvent.click(screen.getByRole('button', { name: /^merge$/i }))

    await waitFor(() => {
      expect(useContactStore.getState().mergeContacts).toHaveBeenCalledWith(
        source.id,
        target.id,
        { email: source.email },
      )
    })
    expect(onClose).toHaveBeenCalled()
  })
})
