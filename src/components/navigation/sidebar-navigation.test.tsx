import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { SidebarNavigation } from './sidebar-navigation'
import { usePathname } from 'next/navigation'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

describe('SidebarNavigation', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/')
  })

  test('renders top header bar with active page title and hamburger menu button', () => {
    render(<SidebarNavigation householdName="Muster Household" />)

    const header = screen.getByRole('banner')
    expect(within(header).getByText('Dashboard')).toBeInTheDocument()
    expect(within(header).getByRole('button', { name: 'Menü öffnen' })).toBeInTheDocument()
  })

  test('renders dynamic page title based on current pathname (e.g. /accounts -> Kontenübersicht)', () => {
    vi.mocked(usePathname).mockReturnValue('/accounts')
    render(<SidebarNavigation householdName="Muster Household" />)

    const header = screen.getByRole('banner')
    expect(within(header).getByText('Kontenübersicht')).toBeInTheDocument()
  })

  test('renders explicit pageTitle prop when provided', () => {
    render(<SidebarNavigation householdName="Muster Household" pageTitle="Spezialansicht" />)

    const header = screen.getByRole('banner')
    expect(within(header).getByText('Spezialansicht')).toBeInTheDocument()
  })

  test('renders household name inside the navigation drawer', async () => {
    const user = userEvent.setup()
    render(<SidebarNavigation householdName="Muster Household" />)

    const menuButton = screen.getByRole('button', { name: 'Menü öffnen' })
    await user.click(menuButton)

    expect(screen.getByText('Muster Household')).toBeInTheDocument()
  })

  test('toggles drawer open and closed via hamburger button, backdrop, close button and Escape key', async () => {
    const user = userEvent.setup()
    render(<SidebarNavigation householdName="Muster Household" />)

    const menuButton = screen.getByRole('button', { name: 'Menü öffnen' })
    const backdrop = screen.getByTestId('sidebar-backdrop')
    const closeButton = screen.getByRole('button', { name: 'Menü schließen' })

    // Initially drawer should not have open attribute or expanded state
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    // Open drawer
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    // Close via close button
    await user.click(closeButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    // Open drawer again and close via backdrop click
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    await user.click(backdrop)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    // Open drawer again and close via Escape key
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  test('renders drawer links with correct hrefs, highlights active route, and closes drawer when link is clicked', async () => {
    const user = userEvent.setup()
    render(<SidebarNavigation householdName="Muster Household" />)

    const menuButton = screen.getByRole('button', { name: 'Menü öffnen' })
    await user.click(menuButton)

    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' })
    const accountsLink = screen.getByRole('link', { name: 'Kontenübersicht' })
    const newTxLink = screen.getByRole('link', { name: 'Neue Transaktion' })

    expect(dashboardLink).toHaveAttribute('href', '/')
    expect(accountsLink).toHaveAttribute('href', '/accounts')
    expect(newTxLink).toHaveAttribute('href', '/transactions/new')

    // Since mock pathname is '/', Dashboard link should be active
    expect(dashboardLink.className).toContain('activeLink')
    expect(accountsLink.className).not.toContain('activeLink')

    // Clicking link closes drawer
    await user.click(accountsLink)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  test('renders logout button and invokes logoutAction callback when form is submitted', async () => {
    const logoutAction = vi.fn()
    const user = userEvent.setup()
    render(<SidebarNavigation householdName="Muster Household" logoutAction={logoutAction} />)

    const menuButton = screen.getByRole('button', { name: 'Menü öffnen' })
    await user.click(menuButton)

    const logoutButton = screen.getByRole('button', { name: 'Abmelden' })
    expect(logoutButton).toBeInTheDocument()

    await user.click(logoutButton)
    expect(logoutAction).toHaveBeenCalledTimes(1)
  })

  test('renders "Benutzerverwaltung" link when role is "superadmin"', async () => {
    const user = userEvent.setup()
    render(<SidebarNavigation householdName="Muster Household" role="superadmin" />)

    const menuButton = screen.getByRole('button', { name: 'Menü öffnen' })
    await user.click(menuButton)

    const adminLink = screen.getByRole('link', { name: 'Benutzerverwaltung' })
    expect(adminLink).toBeInTheDocument()
    expect(adminLink).toHaveAttribute('href', '/admin')
  })

  test('does not render "Benutzerverwaltung" link for "admin", "member", or undefined role', async () => {
    const user = userEvent.setup()

    // When role is member
    const { unmount: unmountMember } = render(
      <SidebarNavigation householdName="Muster Household" role="member" />
    )
    const menuButtonMember = screen.getByRole('button', { name: 'Menü öffnen' })
    await user.click(menuButtonMember)
    expect(screen.queryByRole('link', { name: 'Benutzerverwaltung' })).not.toBeInTheDocument()
    unmountMember()

    // When role is admin
    const { unmount: unmountAdmin } = render(
      <SidebarNavigation householdName="Muster Household" role="admin" />
    )
    const menuButtonAdmin = screen.getByRole('button', { name: 'Menü öffnen' })
    await user.click(menuButtonAdmin)
    expect(screen.queryByRole('link', { name: 'Benutzerverwaltung' })).not.toBeInTheDocument()
    unmountAdmin()

    // When role is undefined / not provided
    render(<SidebarNavigation householdName="Muster Household" />)
    const menuButtonDefault = screen.getByRole('button', { name: 'Menü öffnen' })
    await user.click(menuButtonDefault)
    expect(screen.queryByRole('link', { name: 'Benutzerverwaltung' })).not.toBeInTheDocument()
  })

  test('highlights "Benutzerverwaltung" link as active on /admin and closes drawer when clicked', async () => {
    vi.mocked(usePathname).mockReturnValue('/admin')
    const user = userEvent.setup()
    render(<SidebarNavigation householdName="Muster Household" role="superadmin" />)

    const menuButton = screen.getByRole('button', { name: 'Menü öffnen' })
    await user.click(menuButton)

    const adminLink = screen.getByRole('link', { name: 'Benutzerverwaltung' })
    expect(adminLink.className).toContain('activeLink')

    await user.click(adminLink)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })
})
