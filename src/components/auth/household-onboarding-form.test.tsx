import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HouseholdOnboardingForm } from './household-onboarding-form'
import userEvent from '@testing-library/user-event'

let mockQueryString = ''
const mockReplaceState = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(mockQueryString),
  usePathname: () => '/onboarding/household',
}))

describe('HouseholdOnboardingForm - Flow', () => {
  beforeEach(() => {
    mockQueryString = ''
    vi.clearAllMocks()
    vi.stubGlobal('history', {
      replaceState: mockReplaceState,
    })
  })
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

  it('displays a success toast when "saved=true" is in query parameters', async () => {
    mockQueryString = 'saved=true'

    render(<HouseholdOnboardingForm />)

    // Check that success toast with message "Konten erfolgreich gespeichert." is displayed
    expect(await screen.findByText('Konten erfolgreich gespeichert.')).toBeInTheDocument()
  })

  it('cleans up the "saved" query parameter from the URL immediately', () => {
    mockQueryString = 'saved=true'

    render(<HouseholdOnboardingForm />)

    // Check that replaceState was called to remove the query parameter
    expect(mockReplaceState).toHaveBeenCalledWith(null, '', '/onboarding/household')
  })
})
