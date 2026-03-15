import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CourseForm, type CourseFormData } from './CourseForm'

// Mock fetch globally
global.fetch = vi.fn()

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
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Act
      await user.click(screen.getByRole('button', { name: 'Zapisz' }))

      // Assert
      expect(mockOnSave).not.toHaveBeenCalled()
    }, 8000)

    it('prevents submission when price is invalid', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Act
      await user.type(screen.getByLabelText('Tytuł'), 'Test Course')
      await user.type(screen.getByLabelText('Opis'), 'Test Description')
      await user.type(screen.getByLabelText('Cena (PLN)'), 'invalid')
      await user.click(screen.getByRole('button', { name: 'Zapisz' }))

      // Assert
      expect(mockOnSave).not.toHaveBeenCalled()
    }, 8000)

    it('prevents submission when slug is not available', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ available: false, message: 'Slug zajęty' }),
      })

      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Act
      await user.type(screen.getByLabelText('Tytuł'), 'Test Course')
      await user.type(screen.getByLabelText('Slug (np. moj-kurs)'), 'taken-slug')
      await user.type(screen.getByLabelText('Opis'), 'Test Description')
      await user.type(screen.getByLabelText('Cena (PLN)'), '99')

      // Wait for debounced validation
      vi.advanceTimersByTime(1000)
      await waitFor(() => {
        expect(screen.getByText('Slug zajęty')).toBeInTheDocument()
      }, { timeout: 3000 })

      await user.click(screen.getByRole('button', { name: 'Zapisz' }))

      // Assert
      expect(mockOnSave).not.toHaveBeenCalled()
    }, 8000)
  })

  describe('slug validation', () => {
    it('shows validation error for invalid slug format', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Act
      await user.type(screen.getByLabelText('Slug (np. moj-kurs)'), 'Invalid Slug!')

      // Wait for debounced validation
      vi.advanceTimersByTime(1000)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText('Slug może zawierać tylko małe litery, cyfry i myślniki')
        ).toBeInTheDocument()
      }, { timeout: 3000 })
    }, 8000)

    it('shows success message when slug is available', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ available: true, message: 'Slug jest dostępny' }),
      })

      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Act
      await user.type(screen.getByLabelText('Slug (np. moj-kurs)'), 'available-slug')

      // Wait for debounced validation
      vi.advanceTimersByTime(1000)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Slug jest dostępny ✓')).toBeInTheDocument()
      }, { timeout: 3000 })
    }, 8000)

    it('excludes course ID when validating existing course slug', async () => {
      // Arrange
      const initialCourse = {
        id: 'course-1',
        title: 'Test Course',
        slug: 'test-course',
        description: 'Test Description',
        price: 9900,
        status: 'active' as const,
        sections: [],
      }

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ available: true }),
      })

      render(
        <CourseForm
          initial={initialCourse}
          onCancel={mockOnCancel}
          onSave={mockOnSave}
        />
      )

      // Act
      await user.clear(screen.getByLabelText('Slug (np. moj-kurs)'))
      await user.type(screen.getByLabelText('Slug (np. moj-kurs)'), 'test-course')

      // Wait for debounced validation
      vi.advanceTimersByTime(1000)

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('excludeId=course-1')
        )
      }, { timeout: 3000 })
    }, 8000)
  })

  describe('sections management', () => {
    it('adds new section when + Sekcja button is clicked', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Act
      await user.click(screen.getByRole('button', { name: '+ Sekcja' }))

      // Assert
      expect(screen.getByPlaceholderText('Tytuł sekcji')).toBeInTheDocument()
    }, 8000)

    it('removes section when Usuń sekcję button is clicked', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Add a section first
      await user.click(screen.getByRole('button', { name: '+ Sekcja' }))
      expect(screen.getByPlaceholderText('Tytuł sekcji')).toBeInTheDocument()

      // Act
      await user.click(screen.getByRole('button', { name: 'Usuń sekcję' }))

      // Assert
      expect(screen.queryByPlaceholderText('Tytuł sekcji')).not.toBeInTheDocument()
    }, 8000)

    it('adds SVG item when + Element SVG button is clicked', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Add a section first
      await user.click(screen.getByRole('button', { name: '+ Sekcja' }))

      // Act
      await user.click(screen.getByRole('button', { name: '+ Element SVG' }))

      // Assert
      expect(screen.getByPlaceholderText('Tytuł elementu')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Ścieżka do pliku SVG')).toBeInTheDocument()
    }, 8000)

    it('adds YouTube item when + Element YouTube button is clicked', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Add a section first
      await user.click(screen.getByRole('button', { name: '+ Sekcja' }))

      // Act
      await user.click(screen.getByRole('button', { name: '+ Element YouTube' }))

      // Assert
      expect(screen.getByPlaceholderText('Tytuł elementu')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('URL YouTube')).toBeInTheDocument()
    }, 8000)

    it('removes item when Usuń element button is clicked', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Add a section and an item
      await user.click(screen.getByRole('button', { name: '+ Sekcja' }))
      await user.click(screen.getByRole('button', { name: '+ Element SVG' }))

      expect(screen.getByPlaceholderText('Tytuł elementu')).toBeInTheDocument()

      // Act
      await user.click(screen.getByRole('button', { name: 'Usuń element' }))

      // Assert
      expect(screen.queryByPlaceholderText('Tytuł elementu')).not.toBeInTheDocument()
    }, 8000)

    it('switches between SVG and YouTube item types', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Add a section and an item
      await user.click(screen.getByRole('button', { name: '+ Sekcja' }))
      await user.click(screen.getByRole('button', { name: '+ Element SVG' }))

      // Act - Switch to YouTube
      await user.click(screen.getByLabelText('YouTube'))

      // Assert
      expect(screen.getByPlaceholderText('URL YouTube')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Ścieżka do pliku SVG')).not.toBeInTheDocument()

      // Act - Switch back to SVG
      await user.click(screen.getByLabelText('SVG'))

      // Assert
      expect(screen.getByPlaceholderText('Ścieżka do pliku SVG')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('URL YouTube')).not.toBeInTheDocument()
    }, 8000)
  })

  describe('form submission', () => {
    it('calls onSave with correct form data when valid form is submitted', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ available: true }),
      })

      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Act - Fill form
      await user.type(screen.getByLabelText('Tytuł'), 'Test Course')
      await user.type(screen.getByLabelText('Slug (np. moj-kurs)'), 'test-course')
      await user.type(screen.getByLabelText('Opis'), 'Test Description')
      await user.type(screen.getByLabelText('Cena (PLN)'), '99')

      // Add a section with an item
      await user.click(screen.getByRole('button', { name: '+ Sekcja' }))
      await user.type(screen.getByPlaceholderText('Tytuł sekcji'), 'Test Section')
      await user.click(screen.getByRole('button', { name: '+ Element SVG' }))
      await user.type(screen.getByPlaceholderText('Tytuł elementu'), 'Test Item')
      await user.type(screen.getByPlaceholderText('Ścieżka do pliku SVG'), '/test.svg')

      // Wait for slug validation
      vi.advanceTimersByTime(1000)
      await waitFor(() => {
        expect(screen.getByText('Slug jest dostępny ✓')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Submit form
      await user.click(screen.getByRole('button', { name: 'Zapisz' }))

      // Assert
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Test Course',
        slug: 'test-course',
        description: 'Test Description',
        price: 99,
        status: 'inactive',
        sections: [
          {
            title: 'Test Section',
            items: [
              {
                title: 'Test Item',
                kind: 'svg',
                assetPath: '/test.svg',
                youtubeUrl: '',
              },
            ],
          },
        ],
      } as CourseFormData)
    }, 10000)

    it('calls onCancel when Anuluj button is clicked', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Act
      await user.click(screen.getByRole('button', { name: 'Anuluj' }))

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    }, 8000)
  })

  describe('price handling', () => {
    it('accepts comma as decimal separator', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ available: true }),
      })

      render(<CourseForm onCancel={mockOnCancel} onSave={mockOnSave} />)

      // Act
      await user.type(screen.getByLabelText('Tytuł'), 'Test Course')
      await user.type(screen.getByLabelText('Slug (np. moj-kurs)'), 'test-course')
      await user.type(screen.getByLabelText('Opis'), 'Test Description')
      await user.type(screen.getByLabelText('Cena (PLN)'), '99,50')

      // Add a section
      await user.click(screen.getByRole('button', { name: '+ Sekcja' }))
      await user.type(screen.getByPlaceholderText('Tytuł sekcji'), 'Test Section')

      // Wait for slug validation and submit
      vi.advanceTimersByTime(1000)
      await waitFor(() => {
        expect(screen.getByText('Slug jest dostępny ✓')).toBeInTheDocument()
      }, { timeout: 3000 })

      await user.click(screen.getByRole('button', { name: 'Zapisz' }))

      // Assert
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 99.5,
        })
      )
    }, 10000)
  })
})
