# UI Design System Components

Complete documentation for all UI components in the design system.

## 📦 Installation

```tsx
import { 
  Button, Input, Modal, Card, 
  Container, Grid, Stack,
  Spinner, Badge, Tooltip, Dropdown,
  EmptyState, ErrorState,
  Icon, UserIcon, CartIcon 
} from '@/components/ui';
```

## 🎯 Core Components

### Button

Primary action component with multiple variants and states.

```tsx
import { Button } from '@/components/ui';

// Basic usage
<Button onClick={handleClick}>Click me</Button>

// With variants
<Button variant="primary" size="lg" fullWidth>
  Primary Action
</Button>

// With loading state
<Button loading disabled>
  Processing...
</Button>

// All variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
```

**Props:**
- `variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'`
- `size?: 'sm' | 'md' | 'lg'`
- `loading?: boolean`
- `fullWidth?: boolean`
- `disabled?: boolean`
- Extends `React.ButtonHTMLAttributes<HTMLButtonElement>`

### Input

Form input with label, error states, and helper text.

```tsx
import { Input } from '@/components/ui';

// Basic usage
<Input 
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// With error and helper
<Input 
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error="Password must be at least 8 characters"
  helperText="Use a strong password"
/>

// With icons
<Input 
  label="Search"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  leftIcon={<SearchIcon />}
  rightIcon={<CloseIcon />}
/>
```

**Props:**
- `label?: string`
- `error?: string`
- `helperText?: string`
- `leftIcon?: React.ReactNode`
- `rightIcon?: React.ReactNode`
- Extends `React.InputHTMLAttributes<HTMLInputElement>`

### Modal

Dialog overlay for focused interactions.

```tsx
import { Modal } from '@/components/ui';

<Modal 
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmation"
  size="md"
>
  <p>Are you sure you want to continue?</p>
  <div className="flex gap-2 mt-4">
    <Button onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </div>
</Modal>
```

**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `title?: string`
- `size?: 'sm' | 'md' | 'lg' | 'xl'`

### Card

Flexible container component with variants.

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

// Basic card
<Card variant="default">
  <CardContent>
    <h3>Card Title</h3>
    <p>Card content goes here</p>
  </CardContent>
</Card>

// With header and footer
<Card variant="elevated">
  <CardHeader>
    <h3>Advanced Card</h3>
  </CardHeader>
  <CardContent>
    <p>Main content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Props:**
- `variant?: 'default' | 'elevated' | 'outlined'`
- `padding?: 'none' | 'sm' | 'md' | 'lg'`
- `className?: string`

## 🏗️ Layout Components

### Container

Responsive max-width wrapper for content.

```tsx
import { Container } from '@/components/ui';

<Container size="lg" className="py-8">
  <h1>Page Title</h1>
  <p>Content constrained to max-width</p>
</Container>
```

**Props:**
- `size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'`
- `className?: string`

### Grid

CSS Grid layout system.

```tsx
import { Grid } from '@/components/ui';

// Basic grid
<Grid columns={3} gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>

// Responsive grid
<Grid 
  columns={{ sm: 1, md: 2, lg: 3 }}
  gap="lg"
  template="auto-fit"
>
  {items.map(item => (
    <div key={item.id}>{item.content}</div>
  ))}
</Grid>
```

**Props:**
- `columns?: number | ResponsiveValue<number>`
- `gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'`
- `template?: 'fixed' | 'auto-fit' | 'auto-fill'`
- `minWidth?: string`
- `className?: string`

### Stack

Flexbox layout for one-dimensional arrangements.

```tsx
import { Stack } from '@/components/ui';

// Vertical stack
<Stack direction="column" spacing="md" align="stretch">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>

// Horizontal stack
<Stack direction="row" spacing="sm" align="center">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
  <Button>Button 3</Button>
</Stack>

// Responsive stack
<Stack 
  direction={{ sm: 'column', md: 'row' }}
  spacing="md"
  wrap
>
  {children}
</Stack>
```

**Props:**
- `direction?: 'column' | 'row' | ResponsiveValue<'column' | 'row'>`
- `spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'`
- `align?: 'start' | 'center' | 'end' | 'stretch'`
- `justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'`
- `wrap?: boolean`
- `className?: string`

## 🎨 Advanced Components

### Spinner

Loading indicator with multiple variants.

```tsx
import { Spinner } from '@/components/ui';

// Default spinner
<Spinner />

// With size and color
<Spinner size="lg" color="secondary" />

// Different variants
<Spinner variant="dots" />
<Spinner variant="pulse" />
```

**Props:**
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'`
- `color?: 'primary' | 'secondary' | 'accent' | 'white'`
- `variant?: 'default' | 'dots' | 'pulse'`

### Badge

Small status or label component.

```tsx
import { Badge } from '@/components/ui';

// Basic badge
<Badge>Default</Badge>

// With variants
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="error">Error</Badge>

// With sizes and shape
<Badge size="lg" rounded={false}>Large Badge</Badge>
```

**Props:**
- `variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline'`
- `size?: 'sm' | 'md' | 'lg'`
- `rounded?: boolean`

### Tooltip

Contextual help text on hover/focus.

```tsx
import { Tooltip } from '@/components/ui';

<Tooltip content="Click to save changes" position="top">
  <Button>Save</Button>
</Tooltip>

<Tooltip content="This action cannot be undone" position="right">
  <TrashIcon />
</Tooltip>
```

**Props:**
- `content: React.ReactNode`
- `position?: 'top' | 'bottom' | 'left' | 'right'`
- `delay?: number` (default: 200ms)

### Dropdown

Menu component with keyboard navigation.

```tsx
import { Dropdown } from '@/components/ui';

<Dropdown
  trigger={<Button>Menu</Button>}
  items={[
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserIcon />,
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      onClick: () => navigate('/settings')
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutIcon />,
      danger: true,
      onClick: handleLogout
    }
  ]}
/>
```

**Props:**
- `trigger: React.ReactNode`
- `items: DropdownItem[]`
- `position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'`

## 🎯 State Components

### EmptyState

Component for empty data states.

```tsx
import { EmptyState } from '@/components/ui';

<EmptyState
  icon={<SearchIcon />}
  title="No results found"
  description="Try adjusting your search criteria"
  action={<Button onClick={resetSearch}>Clear Search</Button>}
  size="lg"
/>
```

**Props:**
- `icon?: React.ReactNode`
- `title: string`
- `description?: string`
- `action?: React.ReactNode`
- `size?: 'sm' | 'md' | 'lg'`

### ErrorState

Component for error states with retry functionality.

```tsx
import { ErrorState } from '@/components/ui';

<ErrorState
  title="Something went wrong"
  error={errorMessage}
  onRetry={() => refetch()}
  variant="default"
/>
```

**Props:**
- `title?: string`
- `message?: string`
- `error?: Error | string`
- `onRetry?: () => void`
- `retryText?: string`
- `variant?: 'default' | 'network' | 'not-found'`

## 🎨 Icon System

### Base Icon

Wrapper for consistent icon sizing and styling.

```tsx
import { Icon } from '@/components/ui';

<Icon size="md" color="primary">
  <svg>...</svg>
</Icon>
```

**Props:**
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number`
- `color?: string`
- Extends `React.HTMLAttributes<SVGElement>`

### Predefined Icons

Ready-to-use icons from react-icons.

```tsx
import { 
  UserIcon, CartIcon, SearchIcon, MenuIcon,
  HomeIcon, SettingsIcon, EditIcon, TrashIcon
} from '@/components/ui';

<UserIcon size="lg" />
<CartIcon color="primary" />
<SearchIcon onClick={handleSearch} />
```

**Available Icons:**
- User icons: `UserIcon`
- Navigation: `CartIcon`, `SearchIcon`, `MenuIcon`, `CloseIcon`, `ChevronDownIcon`, `ChevronRightIcon`, `HomeIcon`, `BookIcon`
- Actions: `SettingsIcon`, `LogoutIcon`, `EditIcon`, `TrashIcon`, `PlusIcon`, `MinusIcon`, `CheckIcon`
- Status: `AlertIcon`, `InfoIcon`, `SuccessIcon`, `ErrorIcon`

## 🎨 Design Tokens

### Colors

```css
/* Primary palette */
--coffee-mocha: #3C2415;
--coffee-espresso: #6F4E37;
--coffee-latte: #A67C52;
--coffee-cappuccino: #C4A57B;
--coffee-cream: #F5E6D3;
--coffee-cinnamon: #E8B4A0;
--coffee-macchiato: #8B7355;
--coffee-charcoal: #2C1810;

/* Semantic colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
```

### Spacing

```css
--spacing-xs: 0.25rem;  /* 4px */
--spacing-sm: 0.5rem;   /* 8px */
--spacing-md: 0.75rem;  /* 12px */
--spacing-lg: 1rem;     /* 16px */
--spacing-xl: 1.25rem;  /* 20px */
```

### Typography

```css
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
```

## 📱 Responsive Utilities

```tsx
import { responsive, breakpoints } from '@/lib/responsive';

// Using responsive helper
const gridClass = responsive(
  { sm: 1, md: 2, lg: 3 },
  (cols) => `grid-cols-${cols}`
);

// Breakpoint checks
if (window.matchMedia(breakpoints.md).matches) {
  // Tablet and up
}
```

## 🧪 Accessibility

All components follow WCAG 2.1 AA guidelines:
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA attributes
- Color contrast compliance

## 🎯 Best Practices

1. **Use semantic HTML** - Components render appropriate elements
2. **Provide feedback** - Use loading states and error handling
3. **Maintain consistency** - Follow established patterns
4. **Test accessibility** - Verify keyboard and screen reader support
5. **Responsive first** - Design mobile-first with progressive enhancement

## 🔄 Migration Guide

Replace legacy components:

```tsx
// Old way
<button className="bg-blue-500 text-white px-4 py-2">
  Click me
</button>

// New way
<Button variant="primary">Click me</Button>
```

## 📚 Examples

See the component files for more detailed examples and usage patterns.
