import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AccountCard } from './account-card'
import userEvent from '@testing-library/user-event'

describe('AccountCard', () => {
  it('hides the "Institut" row if the account type is "cash"', async () => {
    const user = userEvent.setup()
    const cashAccount = {
      id: '1',
      type: 'cash' as const,
      name: 'Geldbörse',
      currentValue: '50,00',
      initialDate: '2026-05-25'
    }

    render(<AccountCard account={cashAccount} />)

    // Expand the card
    const header = screen.getByText('Geldbörse')
    await user.click(header)

    // Expect "Institut" to not be visible/present
    expect(screen.queryByText('Institut')).not.toBeInTheDocument()
    
    // Expect Saldo and Datum to be present
    expect(screen.getByText('Saldo')).toBeInTheDocument()
    expect(screen.getByText('Datum')).toBeInTheDocument()
  })

  it('shows the "Institut" row if the account type is "giro"', async () => {
    const user = userEvent.setup()
    const giroAccount = {
      id: '2',
      type: 'giro' as const,
      name: 'Mein Giro',
      institution: 'Sparkasse',
      currentValue: '1000,00',
      initialDate: '2026-05-25'
    }

    render(<AccountCard account={giroAccount} />)

    // Expand the card
    const header = screen.getByText('Mein Giro')
    await user.click(header)

    // Expect "Institut" to be present with value "Sparkasse"
    expect(screen.getByText('Institut')).toBeInTheDocument()
    expect(screen.getByText('Sparkasse')).toBeInTheDocument()
  })
})
