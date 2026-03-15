import React from 'react';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders with default props', () => {
    render(<Avatar />);
    
    const avatar = screen.getByRole('img');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('w-10', 'h-10', 'rounded-full');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Avatar size="xs" />);
    expect(screen.getByRole('img')).toHaveClass('w-6', 'h-6');

    rerender(<Avatar size="lg" />);
    expect(screen.getByRole('img')).toHaveClass('w-12', 'h-12');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Avatar variant="square" />);
    expect(screen.getByRole('img')).toHaveClass('rounded-none');

    rerender(<Avatar variant="rounded" />);
    expect(screen.getByRole('img')).toHaveClass('rounded-lg');
  });

  it('renders with image src', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User avatar" />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(img).toHaveAttribute('alt', 'User avatar');
  });

  it('renders with fallback text', () => {
    render(<Avatar fallback="John Doe" />);
    
    const avatar = screen.getByRole('img');
    expect(avatar).toBeInTheDocument();
    expect(avatar.parentElement).toHaveTextContent('JD');
  });

  it('renders with status indicator', () => {
    render(<Avatar status="online" showStatus />);
    
    const statusIndicator = screen.getByRole('img').nextSibling;
    expect(statusIndicator).toHaveClass('bg-green-500');
  });

  it('renders with custom children', () => {
    render(
      <Avatar>
        <span>Custom content</span>
      </Avatar>
    );
    
    const children = screen.getByText('Custom content');
    expect(children).toBeInTheDocument();
  });

  it('handles image error gracefully', () => {
    render(<Avatar src="invalid-url.jpg" fallback="John Doe" />);
    
    // Should show fallback when image fails to load
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveClass('w-10', 'h-10');
    
    const fallback = screen.getByText('JD');
    expect(fallback).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Avatar ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
