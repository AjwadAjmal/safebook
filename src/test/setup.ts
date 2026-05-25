import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}))

// Mock auth.ts or similar if needed
vi.mock('@/lib/actions/account', () => ({
  createProfileAccounts: vi.fn(),
}))

vi.mock('@/lib/actions/household', () => ({
  createHouseholdAction: vi.fn(),
  joinHouseholdAction: vi.fn(),
}))

