import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProfileCreationForm } from './profile-creation-form'
import userEvent from '@testing-library/user-event'
import { createProfileAccounts } from '@/lib/actions/account'

describe('ProfileCreationForm - Flow', () => {
  it('opens the form directly when clicking a tile', async () => {
    const user = userEvent.setup()
    render(<ProfileCreationForm />)

    // Open the modal for Girokonto
    const giroTile = screen.getByText('Girokonto')
    await user.click(giroTile)

    // Expect the form field "Bezeichnung" to be visible immediately without clicking confirm
    expect(screen.getByLabelText(/Bezeichnung/i)).toBeInTheDocument()
    expect(screen.queryByText(/Möchtest du ein neues Girokonto anlegen/i)).not.toBeInTheDocument()
  })
})

describe('ProfileCreationForm - Saldo Validation', () => {
  it('prevents input of more than 2 decimal places in the balance field', async () => {
    const user = userEvent.setup()
    render(<ProfileCreationForm />)

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
    render(<ProfileCreationForm />)

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

describe('ProfileCreationForm - Grouping & Headers', () => {
  it('displays category headers when accounts are added', async () => {
    const user = userEvent.setup()
    render(<ProfileCreationForm />)

    // Add a Girokonto
    await user.click(screen.getByText('Girokonto'))
    await user.type(screen.getByLabelText(/Bezeichnung/i), 'Mein Giro')
    await user.type(screen.getByLabelText(/Bank \/ Institut/i), 'Bank A')
    await user.type(screen.getByLabelText(/Aktueller Saldo/i), '1000')
    await user.click(screen.getByText('Speichern'))

    // Add a Kasse
    await user.click(screen.getByText('Kasse'))
    await user.type(screen.getByLabelText(/Bezeichnung/i), 'Geldbörse')
    await user.type(screen.getByLabelText(/Aktueller Saldo/i), '50')
    await user.click(screen.getByText('Speichern'))

    // Verify headers are present
    expect(screen.getByText(/Girokonto/i, { selector: 'h3' })).toBeInTheDocument()
    expect(screen.getByText(/Kasse/i, { selector: 'h3' })).toBeInTheDocument()
    // Depot header should NOT be present since no depot account was added
    expect(screen.queryByText(/Aktiendepot/i, { selector: 'h3' })).not.toBeInTheDocument()
  })
})

describe('ProfileCreationForm - Invested Capital Validation', () => {
  it('formats the invested capital field correctly on blur', async () => {
    const user = userEvent.setup()
    render(<ProfileCreationForm />)

    // Open the modal for Aktiendepot
    const depotTile = screen.getByText('Aktiendepot')
    await user.click(depotTile)

    const capitalInput = screen.getByLabelText(/Investiertes Kapital/i) as HTMLInputElement

    // Type "10" and blur
    await user.type(capitalInput, '10')
    fireEvent.blur(capitalInput)
    expect(capitalInput.value).toBe('10,00')

    // Clear and type "10,5" and blur
    await user.clear(capitalInput)
    await user.type(capitalInput, '10,5')
    fireEvent.blur(capitalInput)
    expect(capitalInput.value).toBe('10,50')
  })

  it('prevents saving depot account when required fields are missing/invalid', async () => {
    const user = userEvent.setup()
    render(<ProfileCreationForm />)

    // Open Aktiendepot modal
    await user.click(screen.getByText('Aktiendepot'))

    // Attempt to save immediately with empty fields
    await user.click(screen.getByText('Speichern'))

    // Expect errors to be displayed
    expect(screen.getByText('Name ist erforderlich.')).toBeInTheDocument()
    expect(screen.getByText('Institut ist erforderlich.')).toBeInTheDocument()
    expect(screen.getByText('Saldo ist erforderlich.')).toBeInTheDocument()
    expect(screen.getByText('Investiertes Kapital ist erforderlich.')).toBeInTheDocument()

    // Fill fields, but set negative investedCapital
    await user.type(screen.getByLabelText(/Bezeichnung/i), 'Mein Depot')
    await user.type(screen.getByLabelText(/Bank \/ Institut/i), 'Trade Republic')
    await user.type(screen.getByLabelText(/Aktueller Saldo/i), '1000')
    await user.type(screen.getByLabelText(/Investiertes Kapital/i), '-50')
    await user.click(screen.getByText('Speichern'))

    // Expect name/inst/saldo errors to be gone, but investedCapital error should be negative error
    expect(screen.queryByText('Name ist erforderlich.')).not.toBeInTheDocument()
    expect(screen.getByText('Investiertes Kapital darf nicht negativ sein.')).toBeInTheDocument()
  })

  it('allows saving depot account and submitting successfully when all fields are valid', async () => {
    vi.mocked(createProfileAccounts).mockClear()
    const user = userEvent.setup()
    render(<ProfileCreationForm />)

    // Open Aktiendepot modal
    await user.click(screen.getByText('Aktiendepot'))

    // Fill valid data
    await user.type(screen.getByLabelText(/Bezeichnung/i), 'Spar-Depot')
    await user.type(screen.getByLabelText(/Bank \/ Institut/i), 'Scalable Capital')
    await user.type(screen.getByLabelText(/Aktueller Saldo/i), '5000')
    
    const capitalInput = screen.getByLabelText(/Investiertes Kapital/i) as HTMLInputElement
    await user.type(capitalInput, '4500')
    
    // Blur to check formatting
    fireEvent.blur(capitalInput)
    expect(capitalInput.value).toBe('4500,00')

    // Click Speichern (saves account, closes modal)
    await user.click(screen.getByText('Speichern'))

    // Verify modal is closed (no Speichern button or input)
    expect(screen.queryByLabelText(/Bezeichnung/i)).not.toBeInTheDocument()

    // Submit final form
    await user.click(screen.getByText('Profil speichern'))

    // Verify server action was called
    expect(createProfileAccounts).toHaveBeenCalledTimes(1)
    expect(createProfileAccounts).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'depot',
        name: 'Spar-Depot',
        institution: 'Scalable Capital',
        currentValue: '5000,00',
        investedCapital: '4500,00'
      })
    ])
  })
})

describe('ProfileCreationForm - Cash Account Fields', () => {
  it('hides the Bank / Institut field for cash accounts', async () => {
    const user = userEvent.setup()
    render(<ProfileCreationForm />)

    // Open the modal for Kasse
    const cashTile = screen.getByText('Kasse')
    await user.click(cashTile)

    // Expect Bank / Institut to NOT be in the document
    expect(screen.queryByLabelText(/Bank \/ Institut/i)).not.toBeInTheDocument()
    
    // Expect designation (Bezeichnung) and balance (Aktueller Saldo) to still be in the document
    expect(screen.getByLabelText(/Bezeichnung/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Aktueller Saldo/i)).toBeInTheDocument()
  })
})



