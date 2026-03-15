import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders with default props', () => {
    render(<Skeleton />);
    
    const skeleton = screen.getByRole('img');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('bg-gray-200', 'rounded-md', 'animate-pulse');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Skeleton variant="text" />);
    expect(screen.getByRole('img')).toHaveClass('h-4', 'rounded');

    rerender(<Skeleton variant="circular" />);
    expect(screen.getByRole('img')).toHaveClass('rounded-full');

    rerender(<Skeleton variant="avatar" />);
    expect(screen.getByRole('img')).toHaveClass('rounded-full', 'w-10', 'h-10');

    rerender(<Skeleton variant="button" />);
    expect(screen.getByRole('img')).toHaveClass('h-10');

    rerender(<Skeleton variant="card" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders with custom dimensions', () => {
    render(<Skeleton width={200} height={100} />);
    
    const skeleton = screen.getByRole('img');
    expect(skeleton).toHaveStyle({
      width: '200px',
      height: '100px',
    });
  });

  it('renders with multiple text lines', () => {
    render(<Skeleton variant="text" lines={3} />);
    
    const skeletons = screen.getAllByRole('img');
    expect(skeletons).toHaveLength(3);
  });

  it('renders without animation when disabled', () => {
    render(<Skeleton animated={false} />);
    
    const skeleton = screen.getByRole('img');
    expect(skeleton).not.toHaveClass('animate-pulse');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
