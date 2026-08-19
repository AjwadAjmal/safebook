import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginForm } from './login-form'

let mockQueryString = ''
const mockReplaceState = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(mockQueryString),
  usePathname: () => '/login',
}))

vi.mock('@/lib/actions/auth', () => ({
  loginAction: vi.fn(),
}))

describe('LoginForm - Success Toast Behavior', () => {
  beforeEach(() => {
    mockQueryString = ''
    vi.clearAllMocks()
    vi.stubGlobal('history', {
      replaceState: mockReplaceState,
    })
  })

  it('renders login form without onboardingSuccess parameter and does not show success toast', () => {
    render(<LoginForm />)
    
    // Check that title is rendered
    expect(screen.getByRole('heading', { name: 'Anmelden' })).toBeInTheDocument()
    
    // Ensure success toast is not visible
    expect(screen.queryByText('Haushalt erfolgreich erstellt. Bitte melde dich erneut an.')).not.toBeInTheDocument()
  })

  it('displays a success toast when "onboardingSuccess=true" is in query parameters', async () => {
    mockQueryString = 'onboardingSuccess=true'

    render(<LoginForm />)

    // Check that success toast with exact text is displayed
    expect(await screen.findByText('Haushalt erfolgreich erstellt. Bitte melde dich erneut an.')).toBeInTheDocument()
  })

  it('cleans up the "onboardingSuccess" query parameter from the URL immediately', () => {
    mockQueryString = 'onboardingSuccess=true'

    render(<LoginForm />)

    // Check that replaceState was called to remove the query parameter
    expect(mockReplaceState).toHaveBeenCalledWith(null, '', '/login')
  })

  it('does not render a registration link or footer link to /register', () => {
    render(<LoginForm />)

    expect(screen.queryByRole('link', { name: /registrieren/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/noch kein konto/i)).not.toBeInTheDocument()
  })
})

