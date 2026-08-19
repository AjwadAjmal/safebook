import AccountsPage from './page'
import { render, screen, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { auth } from '@/auth'
import { getHouseholdById } from '@/lib/household-utils'
import { getAccountsByHouseholdId } from '@/lib/account-db'
import { redirect } from 'next/navigation'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  usePathname: vi.fn(() => '/accounts'),
}))

vi.mock('@/lib/household-utils', () => ({
  getHouseholdById: vi.fn(),
}))

vi.mock('@/lib/account-db', () => ({
  getAccountsByHouseholdId: vi.fn(),
}))

describe('Accounts Page (/accounts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /login when user is not authenticated or missing householdId', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    await AccountsPage()

    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('renders accounts page with total balance, group headers with subtotals, and account cards', async () => {
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

    const jsx = await AccountsPage()
    render(jsx)

    // Check Sidebar Navigation / Header household name
    expect(screen.getAllByText('Haushalt Schmidt').length).toBeGreaterThan(0)

    // Check Gesamtsaldo (1500 + 500 + 200 = 2200.00)
    expect(screen.getByText('Gesamtsaldo')).toBeInTheDocument()
    const saldoValue = screen.getByText('2200.00 €')
    expect(saldoValue).toBeInTheDocument()
    expect(saldoValue.className).toContain('saldoPositive')
    expect(saldoValue.className).not.toContain('saldoNegative')

    // Check group headers and group subtotals (must remain neutral)
    expect(screen.getByText('Girokonten')).toBeInTheDocument()
    const giroSubtotal = screen.getByText('1500.00 €')
    expect(giroSubtotal).toBeInTheDocument()
    expect(giroSubtotal.className).not.toContain('saldoPositive')
    expect(giroSubtotal.className).not.toContain('saldoNegative')

    expect(screen.getByText('Aktiendepots')).toBeInTheDocument()
    const depotSubtotal = screen.getByText('500.00 €')
    expect(depotSubtotal).toBeInTheDocument()
    expect(depotSubtotal.className).not.toContain('saldoPositive')
    expect(depotSubtotal.className).not.toContain('saldoNegative')

    expect(screen.getByText('Bargeldkonten')).toBeInTheDocument()
    const cashSubtotal = screen.getByText('200.00 €')
    expect(cashSubtotal).toBeInTheDocument()
    expect(cashSubtotal.className).not.toContain('saldoPositive')
    expect(cashSubtotal.className).not.toContain('saldoNegative')

    // Check account names
    expect(screen.getByText('Girokonto A')).toBeInTheDocument()
    expect(screen.getByText('Aktiendepot B')).toBeInTheDocument()
    expect(screen.getByText('Bargeld C')).toBeInTheDocument()
  })

  it('renders negative Gesamtsaldo with negative styling and zero Gesamtsaldo with neutral styling on /accounts', async () => {
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

    // Test negative balance (-500.00)
    vi.mocked(getAccountsByHouseholdId).mockResolvedValue([
      {
        id: 'acc-1',
        userId: 'user-123',
        householdId: 'household-456',
        type: 'giro' as const,
        name: 'Girokonto A',
        institution: 'Sparkasse',
        currentValue: '-500.00',
        investedCapital: null,
        initialDate: new Date('2026-07-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const jsxNegative = await AccountsPage()
    const { unmount } = render(jsxNegative!)

    const negativeCard = screen.getByText('Gesamtsaldo').parentElement!
    const negativeSaldo = within(negativeCard).getByText('-500.00 €')
    expect(negativeSaldo.className).toContain('saldoNegative')
    expect(negativeSaldo.className).not.toContain('saldoPositive')

    // Subtotal must remain neutral
    const giroGroup = screen.getByText('Girokonten').parentElement!
    const negativeSubtotal = within(giroGroup).getByText('-500.00 €')
    expect(negativeSubtotal.className).not.toContain('saldoNegative')
    expect(negativeSubtotal.className).not.toContain('saldoPositive')

    unmount()

    // Test zero balance (0.00)
    vi.mocked(getAccountsByHouseholdId).mockResolvedValue([
      {
        id: 'acc-1',
        userId: 'user-123',
        householdId: 'household-456',
        type: 'cash' as const,
        name: 'Bargeld C',
        institution: null,
        currentValue: '0.00',
        investedCapital: null,
        initialDate: new Date('2026-07-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const jsxZero = await AccountsPage()
    render(jsxZero!)

    const zeroCard = screen.getByText('Gesamtsaldo').parentElement!
    const zeroSaldo = within(zeroCard).getByText('0.00 €')
    expect(zeroSaldo.className).not.toContain('saldoPositive')
    expect(zeroSaldo.className).not.toContain('saldoNegative')
  })
})


