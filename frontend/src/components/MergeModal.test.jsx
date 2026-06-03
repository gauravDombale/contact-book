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
  email: '',
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

  it('summarizes automatic additions and submits selected source overrides', async () => {
    const onClose = vi.fn()
    render(<MergeModal contact={source} onClose={onClose} />)

    await userEvent.selectOptions(screen.getByRole('combobox'), target.id)

    expect(screen.getByText('Amit Sharma will remain.')).toBeInTheDocument()
    expect(screen.getByText('Details that will be added')).toBeInTheDocument()
    expect(screen.getByText('source@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /review 1 different details/i })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /review 1 different details/i }))
    await userEvent.click(screen.getByLabelText(/use duplicate's phone/i))
    await userEvent.click(screen.getByRole('button', { name: /^merge$/i }))

    await waitFor(() => {
      expect(useContactStore.getState().mergeContacts).toHaveBeenCalledWith(
        source.id,
        target.id,
        { phone: source.phone },
      )
    })
    expect(onClose).toHaveBeenCalled()
  })
})
