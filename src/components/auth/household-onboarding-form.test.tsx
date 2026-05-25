import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HouseholdOnboardingForm } from './household-onboarding-form'
import userEvent from '@testing-library/user-event'

describe('HouseholdOnboardingForm - Flow', () => {
  it('renders the household creation form by default', () => {
    render(<HouseholdOnboardingForm />)
    
    // Check main title
    expect(screen.getByText('Willkommen bei Safebook')).toBeInTheDocument()
    // Check description for create mode
    expect(screen.getByText('Erstelle einen neuen Haushalt für dich oder deine Familie.')).toBeInTheDocument()
    // Check input field
    expect(screen.getByLabelText('Name des Haushalts')).toBeInTheDocument()
    // Check submit button
    expect(screen.getByRole('button', { name: 'Haushalt erstellen' })).toBeInTheDocument()
  })

  it('switches to join mode when clicking the Beitreten tab', async () => {
    const user = userEvent.setup()
    render(<HouseholdOnboardingForm />)

    // Switch to Join tab
    const joinTabButton = screen.getByRole('button', { name: 'Beitreten' })
    await user.click(joinTabButton)

    // Check description for join mode
    expect(screen.getByText('Gib den Einladungscode ein, um einem Haushalt beizutreten.')).toBeInTheDocument()
    // Check input field
    expect(screen.getByLabelText('Einladungscode')).toBeInTheDocument()
    // Check submit button
    expect(screen.getByRole('button', { name: 'Haushalt beitreten' })).toBeInTheDocument()
  })

  it('renders unlinked accounts checkbox list if provided', () => {
    const mockAccounts = [
      { id: '1', name: 'Girokonto A', type: 'giro' },
      { id: '2', name: 'Depot B', type: 'depot' }
    ]

    render(<HouseholdOnboardingForm unlinkedAccounts={mockAccounts} />)

    // Check that accounts section is rendered
    expect(screen.getByText('Konten zum Importieren auswählen')).toBeInTheDocument()
    expect(screen.getByText('Girokonto A')).toBeInTheDocument()
    expect(screen.getByText('Depot B')).toBeInTheDocument()
  })
})
