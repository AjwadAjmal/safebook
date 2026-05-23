import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AccountOnboardingForm } from './account-onboarding-form'
import userEvent from '@testing-library/user-event'

describe('AccountOnboardingForm - Flow', () => {
  it('opens the form directly when clicking a tile', async () => {
    const user = userEvent.setup()
    render(<AccountOnboardingForm />)

    // Open the modal for Girokonto
    const giroTile = screen.getByText('Girokonto')
    await user.click(giroTile)

    // Expect the form field "Bezeichnung" to be visible immediately without clicking confirm
    expect(screen.getByLabelText(/Bezeichnung/i)).toBeInTheDocument()
    expect(screen.queryByText(/Möchtest du ein neues Girokonto anlegen/i)).not.toBeInTheDocument()
  })
})

describe('AccountOnboardingForm - Saldo Validation', () => {
  it('prevents input of more than 2 decimal places in the balance field', async () => {
    const user = userEvent.setup()
    render(<AccountOnboardingForm />)

    // Open the modal for Girokonto
    const giroTile = screen.getByText('Girokonto')
    await user.click(giroTile)

    // Find the balance input
    const balanceInput = screen.getByLabelText(/Aktueller Saldo/i) as HTMLInputElement

    // Try to type "10.123"
    await user.type(balanceInput, '10.123')

    // Expect the value to be "10.12"
    expect(balanceInput.value).toBe('10.12')
  })

  it('formats the balance field correctly on blur', async () => {
    const user = userEvent.setup()
    render(<AccountOnboardingForm />)

    // Open the modal for Girokonto
    const giroTile = screen.getByText('Girokonto')
    await user.click(giroTile)

    const balanceInput = screen.getByLabelText(/Aktueller Saldo/i) as HTMLInputElement

    // Type "10" and blur
    await user.type(balanceInput, '10')
    fireEvent.blur(balanceInput)
    expect(balanceInput.value).toBe('10,00')

    // Clear and type "10,5" and blur
    await user.clear(balanceInput)
    await user.type(balanceInput, '10,5')
    fireEvent.blur(balanceInput)
    expect(balanceInput.value).toBe('10,50')
  })
})

describe('AccountOnboardingForm - Grouping & Headers', () => {
  it('displays category headers when accounts are added', async () => {
    const user = userEvent.setup()
    render(<AccountOnboardingForm />)

    // Add a Girokonto
    await user.click(screen.getByText('Girokonto'))
    await user.type(screen.getByLabelText(/Bezeichnung/i), 'Mein Giro')
    await user.type(screen.getByLabelText(/Bank \/ Institut/i), 'Bank A')
    await user.type(screen.getByLabelText(/Aktueller Saldo/i), '1000')
    await user.click(screen.getByText('Speichern'))

    // Add a Kasse
    await user.click(screen.getByText('Kasse'))
    await user.type(screen.getByLabelText(/Bezeichnung/i), 'Geldbörse')
    await user.type(screen.getByLabelText(/Bank \/ Institut/i), 'Bar')
    await user.type(screen.getByLabelText(/Aktueller Saldo/i), '50')
    await user.click(screen.getByText('Speichern'))

    // Verify headers are present
    expect(screen.getByText(/Girokonto/i, { selector: 'h3' })).toBeInTheDocument()
    expect(screen.getByText(/Kasse/i, { selector: 'h3' })).toBeInTheDocument()
    // Depot header should NOT be present since no depot account was added
    expect(screen.queryByText(/Aktiendepot/i, { selector: 'h3' })).not.toBeInTheDocument()
  })
})


