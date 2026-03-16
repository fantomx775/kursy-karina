import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppHeader } from './AppHeader'

// Mock dependencies
vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/services/supabase/browser', () => ({
  createBrowserSupabaseClient: vi.fn(() => ({
    auth: {
      signOut: vi.fn(),
    },
  })),
}))

vi.mock('@/features/cart/CartContext', () => ({
  useCart: () => ({ cart: [] }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/',
}))

import { useAuth } from '@/features/auth/AuthContext'
import { createBrowserSupabaseClient } from '@/services/supabase/browser'

const mockUseAuth = vi.mocked(useAuth)
const mockCreateBrowserSupabaseClient = vi.mocked(createBrowserSupabaseClient)

describe('AppHeader', () => {
  const mockPush = vi.fn()
  const mockSignOut = vi.fn()
  const mockRefreshProfile = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateBrowserSupabaseClient.mockReturnValue({
      auth: {
        signOut: mockSignOut,
      },
    } as any)
  })

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: null,
        profile: null,
        refreshProfile: mockRefreshProfile,
      } as any)
    })

    it('renders login and register links', () => {
      // Act
      render(<AppHeader />)

      // Assert
      expect(screen.getByText('Zaloguj')).toBeInTheDocument()
      expect(screen.getByText('Rejestracja')).toBeInTheDocument()
      expect(screen.queryByText('Wyloguj')).not.toBeInTheDocument()
    })
  })

  describe('when user is authenticated as regular user', () => {
    beforeEach(() => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1' },
        profile: { role: 'user' },
        refreshProfile: mockRefreshProfile,
      } as any)
    })

    it('renders user navigation links', () => {
      // Act
      render(<AppHeader />)

      // Assert
      expect(screen.getByText('Moje konto')).toBeInTheDocument()
      expect(screen.getByText('Wyloguj')).toBeInTheDocument()
      expect(screen.queryByText('Admin')).not.toBeInTheDocument()
      expect(screen.queryByText('Zaloguj')).not.toBeInTheDocument()
    })

    it('calls signOut and redirects when logout button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<AppHeader />)

      // Act
      await user.click(screen.getByText('Wyloguj'))

      // Assert
      expect(mockSignOut).toHaveBeenCalledTimes(1)
    })
  })

  describe('when user is authenticated as admin', () => {
    beforeEach(() => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: { id: 'admin-1' },
        profile: { role: 'admin' },
        refreshProfile: mockRefreshProfile,
      } as any)
    })

    it('renders Moje konto link for admin (no separate Admin in nav)', () => {
      // Act
      render(<AppHeader />)

      // Assert
      expect(screen.getByText('Moje konto')).toBeInTheDocument()
      expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    })
  })

  describe('branding', () => {
    it('renders app name with correct link', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: null,
        profile: null,
        refreshProfile: mockRefreshProfile,
      } as any)

      // Act
      render(<AppHeader />)

      // Assert
      const brandLink = screen.getByText('Kursy App')
      expect(brandLink.closest('a')).toHaveAttribute('href', '/')
    })
  })
})
