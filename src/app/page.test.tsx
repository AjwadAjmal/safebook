import Home from './page'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { auth } from '@/auth'
import { getHouseholdById } from '@/lib/household-utils'
import { getAccountsByHouseholdId } from '@/lib/account-db'
import { getRecentTransactionsWithDetails } from '@/lib/transaction-db'
import { getCategoriesForHousehold } from '@/lib/category-db'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('@/lib/household-utils', () => ({
  getHouseholdById: vi.fn(),
}))

vi.mock('@/lib/account-db', () => ({
  getAccountsByHouseholdId: vi.fn(),
}))

vi.mock('@/lib/transaction-db', () => ({
  getRecentTransactionsWithDetails: vi.fn(),
}))

vi.mock('@/lib/category-db', () => ({
  getCategoriesForHousehold: vi.fn(),
}))


describe('Root Page (Home) - Landing vs Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders landing page when user is not logged in', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const jsx = await Home()
    render(jsx)

    expect(screen.getByRole('heading', { name: 'Safebook' })).toBeInTheDocument()
    expect(screen.getByText(/Dein privates, datenschutzorientiertes Haushaltsbuch/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Anmelden' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Registrieren' })).toBeInTheDocument()
  })

  it('renders dashboard when user is logged in and has a householdId', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        role: 'admin' as const,
        householdId: 'household-456',
        name: 'TestUser',
      },
      expires: 'token-expires',
    }
    vi.mocked(auth).mockResolvedValue(mockSession)

    vi.mocked(getHouseholdById).mockResolvedValue({
      id: 'household-456',
      name: 'Haushalt Schmidt',
      inviteCode: 'INV123',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const mockAccounts = [
      {
        id: 'acc-1',
        userId: 'user-123',
        householdId: 'household-456',
        type: 'giro' as const,
        name: 'Girokonto A',
        institution: 'Sparkasse',
        currentValue: '1500.00',
        investedCapital: null,
        initialDate: new Date('2026-07-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'acc-2',
        userId: 'user-123',
        householdId: 'household-456',
        type: 'depot' as const,
        name: 'Aktiendepot B',
        institution: 'Trade Republic',
        currentValue: '500.00',
        investedCapital: '400.00',
        initialDate: new Date('2026-07-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'acc-3',
        userId: 'user-123',
        householdId: 'household-456',
        type: 'cash' as const,
        name: 'Bargeld C',
        institution: null,
        currentValue: '200.00',
        investedCapital: null,
        initialDate: new Date('2026-07-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    vi.mocked(getAccountsByHouseholdId).mockResolvedValue(mockAccounts)
    vi.mocked(getRecentTransactionsWithDetails).mockResolvedValue([])
    vi.mocked(getCategoriesForHousehold).mockResolvedValue([])

    const jsx = await Home()
    render(jsx)

    // Check header
    expect(screen.getByText('Haushalt Schmidt')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abmelden' })).toBeInTheDocument()

    // Check Gesamtsaldo (1500 + 500 + 200 = 2200.00)
    expect(screen.getByText('Gesamtsaldo')).toBeInTheDocument()
    expect(screen.getByText('2200.00 €')).toBeInTheDocument()

    // Check quicklink button
    expect(screen.getByRole('link', { name: /Neue Transaktion/i })).toBeInTheDocument()

    // Check account names
    expect(screen.getByText('Girokonto A')).toBeInTheDocument()
    expect(screen.getByText('Aktiendepot B')).toBeInTheDocument()
    expect(screen.getByText('Bargeld C')).toBeInTheDocument()

    // Check recent transactions section
    expect(screen.getByText('Letzte Transaktionen')).toBeInTheDocument()
  })
})

