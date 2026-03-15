import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CourseForm, type CourseFormData } from './CourseForm'

// Mock fetch globally
global.fetch = vi.fn()

// Mock URL constructor to handle window.location.origin
const mockURL = vi.fn((url: string, base?: string) => {
  if (url.startsWith('/api/admin/courses/validate-slug/')) {
    return {
      toString: () => `http://localhost:3000${url}`,
      searchParams: new URLSearchParams(),
    }
  }
  return new URL(url, base || 'http://localhost:3000')
})

// Mock the URL constructor globally
vi.stubGlobal('URL', mockURL)

const mockOnSave = vi.fn()
const mockOnCancel = vi.fn()

describe('CourseForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // Setup default fetch mock
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('renders empty form when no initial data provided', () => {
      // Act
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Assert
      expect(screen.getByLabelText('Tytuł')).toHaveValue('')
      expect(screen.getByLabelText('Slug (np. moj-kurs)')).toHaveValue('')
      expect(screen.getByLabelText('Opis')).toHaveValue('')
      expect(screen.getByLabelText('Cena (PLN)')).toHaveValue('')
      expect(screen.getByDisplayValue('Nieaktywny')).toBeInTheDocument()
    })

    it('populates form with initial data when provided', () => {
      // Arrange
      const initialCourse = {
        id: 'course-1',
        title: 'Test Course',
        slug: 'test-course',
        description: 'Test Description',
        price: 9900, // 99.00 PLN in cents
        status: 'active' as const,
        sections: [],
      }

      // Act
      render(
        <CourseForm
          initial={initialCourse}
          onCancel={mockOnCancel}
          onSave={mockOnSave}
        />
      )

      // Assert
      expect(screen.getByDisplayValue('Test Course')).toBeInTheDocument()
      expect(screen.getByDisplayValue('test-course')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
      expect(screen.getByDisplayValue('99')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Aktywny')).toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('prevents submission when required fields are empty', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Act
      await user.click(screen.getByRole('button', { name: 'Zapisz' }))

      // Assert
      expect(mockOnSave).not.toHaveBeenCalled()
    }, 15000)

    it('prevents submission when price is invalid', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Act
      await user.type(screen.getByLabelText('Tytuł'), 'Test Course')
      await user.type(screen.getByLabelText('Opis'), 'Test Description')
      await user.type(screen.getByLabelText('Cena (PLN)'), 'invalid')
      await user.click(screen.getByRole('button', { name: 'Zapisz' }))

      // Assert
      expect(mockOnSave).not.toHaveBeenCalled()
    }, 15000)
  })

  describe('sections management', () => {
    it('adds new section when + Sekcja button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Act
      await user.click(screen.getByRole('button', { name: '+ Sekcja' }))

      // Assert
      expect(screen.getByPlaceholderText('Tytuł sekcji')).toBeInTheDocument()
    }, 15000)

    it('removes section when Usuń sekcję button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Add a section first
      await user.click(screen.getByRole('button', { name: '+ Sekcja' }))
      expect(screen.getByPlaceholderText('Tytuł sekcji')).toBeInTheDocument()

      // Act
      await user.click(screen.getByRole('button', { name: 'Usuń sekcję' }))

      // Assert
      expect(screen.queryByPlaceholderText('Tytuł sekcji')).not.toBeInTheDocument()
    }, 15000)

    it('adds SVG item when + Element SVG button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Add a section first
      await user.click(screen.getByRole('button', { name: '+ Sekcja' }))

      // Act
      await user.click(screen.getByRole('button', { name: '+ Element SVG' }))

      // Assert
      expect(screen.getByPlaceholderText('Tytuł elementu')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Ścieżka do pliku SVG')).toBeInTheDocument()
    }, 15000)

    it('adds YouTube item when + Element YouTube button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Add a section first
      await user.click(screen.getByRole('button', { name: '+ Sekcja' }))

      // Act
      await user.click(screen.getByRole('button', { name: '+ Element YouTube' }))

      // Assert
      expect(screen.getByPlaceholderText('Tytuł elementu')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('URL YouTube')).toBeInTheDocument()
    }, 15000)
  })

  describe('form submission', () => {
    it('calls onCancel when Anuluj button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Act
      await user.click(screen.getByRole('button', { name: 'Anuluj' }))

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    }, 15000)
  })

  describe('price handling', () => {
    it('accepts comma as decimal separator', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Act
      await user.type(screen.getByLabelText('Tytuł'), 'Test Course')
      await user.type(screen.getByLabelText('Slug (np. moj-kurs)'), 'test-course')
      await user.type(screen.getByLabelText('Opis'), 'Test Description')
      await user.type(screen.getByLabelText('Cena (PLN)'), '99,50')

      // Add a section
      await user.click(screen.getByRole('button', { name: '+ Sekcja' }))
      await user.type(screen.getByPlaceholderText('Tytuł sekcji'), 'Test Section')

      await user.click(screen.getByRole('button', { name: 'Zapisz' }))

      // Assert - Check that the price field accepts comma input
      expect(screen.getByDisplayValue('99,50')).toBeInTheDocument()
    }, 15000)
  })
})
