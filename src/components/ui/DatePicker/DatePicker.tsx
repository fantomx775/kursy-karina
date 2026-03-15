"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  format?: string;
  minDate?: string;
  maxDate?: string;
  onChange?: (value: string) => void;
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({
    value,
    placeholder = 'Select date',
    disabled = false,
    error,
    helperText,
    format = 'YYYY-MM-DD',
    minDate,
    maxDate,
    onChange,
    className,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(
      value ? new Date(value) : null
    );
    const inputRef = useRef<HTMLInputElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);

    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days = [];
      
      // Add empty cells for days before month starts
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add all days of the month
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
      }
      
      return days;
    };

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const isDateDisabled = (date: Date) => {
      if (minDate && date < new Date(minDate)) return true;
      if (maxDate && date > new Date(maxDate)) return true;
      return false;
    };

    const isToday = (date: Date) => {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    };

    const isSelected = (date: Date) => {
      if (!selectedDate) return false;
      return (
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
      );
    };

    const handleDateSelect = useCallback((date: Date) => {
      if (isDateDisabled(date)) return;
      
      setSelectedDate(date);
      setIsOpen(false);
      onChange?.(formatDate(date));
    }, [selectedDate, onChange]);

    const handlePrevMonth = useCallback(() => {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
    }, []);

    const handleNextMonth = useCallback(() => {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      onChange?.(value);
      
      if (value) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
          setCurrentMonth(date);
        }
      } else {
        setSelectedDate(null);
      }
    }, [onChange]);

    const handleToggle = useCallback(() => {
      if (disabled) return;
      setIsOpen(!isOpen);
    }, [disabled, isOpen]);

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          inputRef.current && !inputRef.current.contains(event.target as Node) &&
          calendarRef.current && !calendarRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days = getDaysInMonth(currentMonth);

    return (
      <div className="relative w-full">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value || ''}
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleInputChange}
            onClick={handleToggle}
            className={cn(
              'w-full px-4 py-2 bg-white border border-radius shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-[var(--coffee-mocha)] focus:ring-offset-2',
              'transition-colors duration-200',
              'pr-10', // Space for calendar icon
              disabled && 'opacity-50 cursor-not-allowed',
              error && 'border-red-500 focus:ring-red-500',
              !error && 'border-[var(--coffee-cappuccino)] hover:border-[var(--coffee-mocha)]',
              className
            )}
            {...props}
          />
          
          <button
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Open calendar"
          >
            <FiCalendar className="w-4 h-4" />
          </button>
        </div>

        {isOpen && (
          <div
            ref={calendarRef}
            className="absolute z-50 mt-1 bg-white border border-[var(--coffee-cappuccino)] border-radius shadow-lg p-4"
            style={{ minWidth: '320px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 text-gray-600 hover:text-[var(--coffee-mocha)] border-radius hover:bg-[var(--coffee-cream)]"
                aria-label="Previous month"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="text-lg font-semibold text-[var(--coffee-charcoal)]">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>
              
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 text-gray-600 hover:text-[var(--coffee-mocha)] border-radius hover:bg-[var(--coffee-cream)]"
                aria-label="Next month"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Week days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div
                  key={day}
                  className="text-xs font-medium text-gray-600 text-center py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <button
                  key={index}
                  type="button"
                  disabled={!date || isDateDisabled(date)}
                  onClick={() => date && handleDateSelect(date)}
                  className={cn(
                    'h-8 w-8 text-sm border-radius transition-colors duration-150',
                    'flex items-center justify-center',
                    !date && 'invisible',
                    date && !isDateDisabled(date) && 'hover:bg-[var(--coffee-cream)] cursor-pointer',
                    date && isDateDisabled(date) && 'text-gray-400 cursor-not-allowed',
                    date && isSelected(date) && 'bg-[var(--coffee-mocha)] text-white hover:bg-[var(--coffee-mocha)]',
                    date && isToday(date) && !isSelected(date) && 'bg-[var(--coffee-cream)] font-semibold'
                  )}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>
          </div>
        )}

        {helperText && (
          <p className={cn(
            'mt-1 text-sm',
            error ? 'text-red-600' : 'text-gray-600'
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
