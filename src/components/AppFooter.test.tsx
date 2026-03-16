import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AppFooter } from './AppFooter'

// Mock Date to get consistent year
const mockDate = new Date('2024-01-01')
vi.setSystemTime(mockDate)

describe('AppFooter', () => {
  it('renders copyright with current year', () => {
    // Act
    render(<AppFooter />)

    // Assert
    expect(screen.getByText('© 2024 Kursy Karina Koziara')).toBeInTheDocument()
  })

  it('renders privacy policy link', () => {
    // Act
    render(<AppFooter />)

    // Assert
    const privacyLink = screen.getByText('Polityka prywatności')
    expect(privacyLink).toBeInTheDocument()
    expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy')
  })

  it('renders terms link', () => {
    // Act
    render(<AppFooter />)

    // Assert
    const termsLink = screen.getByText('Regulamin')
    expect(termsLink).toBeInTheDocument()
    expect(termsLink.closest('a')).toHaveAttribute('href', '/terms')
  })

  it('has correct footer structure and styling', () => {
    // Act
    render(<AppFooter />)

    // Assert
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('border-t', 'border-[var(--coffee-cappuccino)]', 'bg-white')
  })
})
