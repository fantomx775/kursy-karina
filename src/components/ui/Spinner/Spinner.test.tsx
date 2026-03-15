import React from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner />);
    
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-6', 'h-6', 'animate-spin');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Spinner size="xs" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('w-4', 'h-4');

    rerender(<Spinner size="lg" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('w-8', 'h-8');

    rerender(<Spinner size="xl" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('w-12', 'h-12');
  });

  it('renders with different colors', () => {
    const { rerender } = render(<Spinner color="primary" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('text-[var(--coffee-mocha)]');

    rerender(<Spinner color="secondary" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('text-[var(--coffee-macchiato)]');

    rerender(<Spinner color="white" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('text-white');
  });

  it('renders dots variant', () => {
    render(<Spinner variant="dots" />);
    
    const dots = screen.getAllByRole('img', { hidden: true });
    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveClass('animate-bounce');
  });

  it('renders pulse variant', () => {
    render(<Spinner variant="pulse" />);
    
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toHaveClass('animate-pulse', 'opacity-75');
  });

  it('supports custom className', () => {
    render(<Spinner className="custom-spinner" />);
    
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toHaveClass('custom-spinner');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Spinner ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
