import AdminPage from './page'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { auth } from '@/auth'
import { getAdminUsersList } from '@/lib/admin-db'
import { redirect } from 'next/navigation'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  usePathname: vi.fn(() => '/admin'),
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
  })),
}))

vi.mock('@/lib/admin-db', () => ({
  getAdminUsersList: vi.fn(),
}))

describe('Admin Page Server Component (/admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /login when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    await AdminPage()

    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('redirects to / when user is authenticated with member or admin role', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'user-1',
        role: 'member',
        username: 'normalUser',
      },
      expires: 'token',
    } as never)

    await AdminPage()

    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('renders admin page when user has superadmin role', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'super-1',
        role: 'superadmin',
        username: 'dev',
        householdName: 'Haushalt Admin',
      },
      expires: 'token',
    } as never)

    vi.mocked(getAdminUsersList).mockResolvedValue([
      {
        id: 'super-1',
        username: 'dev',
        role: 'superadmin',
        householdId: null,
        householdName: null,
        accountsCount: 0,
        createdAt: new Date('2026-08-01'),
      },
    ])

    const jsx = await AdminPage()
    render(jsx!)

    expect(screen.getByText('Benutzerverwaltung')).toBeInTheDocument()
    expect(screen.getByText('Neuen Benutzer anlegen')).toBeInTheDocument()
    expect(screen.getByText('Registrierte Benutzer')).toBeInTheDocument()
  })
})
