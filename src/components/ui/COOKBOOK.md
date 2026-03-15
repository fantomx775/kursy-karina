# UI Design System Cookbook

This cookbook provides practical examples and patterns for using the UI Design System components effectively.

## Table of Contents

- [Getting Started](#getting-started)
- [Component Patterns](#component-patterns)
- [Layout Patterns](#layout-patterns)
- [Form Patterns](#form-patterns)
- [Data Display Patterns](#data-display-patterns)
- [Advanced Patterns](#advanced-patterns)
- [Performance Tips](#performance-tips)

## Getting Started

### Installation

```bash
npm install @your-org/ui-components
```

### Basic Usage

```tsx
import { Button, Input, Card } from '@/components/ui';

function MyComponent() {
  return (
    <Card>
      <Input label="Name" placeholder="Enter your name" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

## Component Patterns

### Button Variants

```tsx
// Primary action button
<Button variant="primary" size="lg">Save Changes</Button>

// Secondary action
<Button variant="secondary" size="md">Cancel</Button>

// Danger action
<Button variant="danger" size="sm">Delete</Button>

// Loading state
<Button loading={true}>Processing...</Button>

// Full width
<Button fullWidth>Full Width Button</Button>
```

### Input Patterns

```tsx
// Basic input with label
<Input label="Email" type="email" placeholder="Enter email" />

// Input with error state
<Input 
  label="Password" 
  type="password" 
  error="Password must be at least 8 characters"
  placeholder="Enter password"
/>

// Input with helper text
<Input 
  label="Username"
  helperText="Choose a unique username"
  placeholder="Enter username"
/>

// Input with icon
<Input 
  label="Search"
  leftIcon={<FiSearch />}
  placeholder="Search..."
/>
```

### Card Patterns

```tsx
// Basic card
<Card>
  <div className="p-4">
    <h3>Card Title</h3>
    <p>Card content goes here.</p>
  </div>
</Card>

// Card with header
<Card>
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">Card Title</h3>
    <p>Card content goes here.</p>
  </div>
  <div className="px-4 py-3 bg-gray-50 border-t">
    <Button size="sm">Action</Button>
  </div>
</Card>

// Interactive card
<Card interactive>
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">Clickable Card</h3>
    <p>Click this card to trigger an action.</p>
  </div>
</Card>
```

## Layout Patterns

### Container Usage

```tsx
// Different container sizes
<Container size="sm">Small container</Container>
<Container size="md">Medium container</Container>
<Container size="lg">Large container</Container>
<Container size="xl">Extra large container</Container>
```

### Grid Layout

```tsx
// Basic grid
<Grid columns={3} gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>

// Responsive grid
<Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="lg">
  <div>Responsive item 1</div>
  <div>Responsive item 2</div>
  <div>Responsive item 3</div>
</Grid>

// Grid with custom template
<Grid 
  columns="repeat(3, 1fr)" 
  gap="md"
  className="min-h-[200px]"
>
  <div>Grid item 1</div>
  <div>Grid item 2</div>
  <div>Grid item 3</div>
</Grid>
```

### Stack Layout

```tsx
// Vertical stack
<Stack direction="vertical" spacing="lg">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>

// Horizontal stack
<Stack direction="horizontal" spacing="md" className="items-center">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>

// Mixed stack
<Stack direction="vertical" spacing="md">
  <Stack direction="horizontal" spacing="sm" className="items-center">
    <div>Horizontal item 1</div>
    <div>Horizontal item 2</div>
  </Stack>
  <div>Vertical item</div>
</Stack>
```

## Form Patterns

### Form Layout

```tsx
function UserForm() {
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">User Registration</h2>
        
        <Stack direction="vertical" spacing="lg">
          <Input label="Full Name" placeholder="Enter your name" />
          <Input label="Email" type="email" placeholder="Enter your email" />
          <Select
            label="Country"
            options={[
              { value: 'us', label: 'United States' },
              { value: 'uk', label: 'United Kingdom' },
              { value: 'ca', label: 'Canada' },
            ]}
            placeholder="Select your country"
          />
          <DatePicker label="Birth Date" />
        </Stack>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline">Cancel</Button>
          <Button variant="primary">Register</Button>
        </div>
      </div>
    </Card>
  );
}
```

### Form Validation

```tsx
function ValidatedForm() {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        error={errors.email}
      />
      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        error={errors.password}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Multi-step Form

```tsx
function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, totalSteps));
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 1));

  return (
    <Card>
      <div className="p-6">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        {currentStep === 1 && (
          <div>
            <h3>Personal Information</h3>
            <Input label="Name" placeholder="Enter your name" />
            <Input label="Email" type="email" placeholder="Enter your email" />
            <Button onClick={nextStep}>Next</Button>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3>Account Details</h3>
            <Input label="Username" placeholder="Choose username" />
            <Input label="Password" type="password" placeholder="Choose password" />
            <div className="flex gap-4">
              <Button onClick={prevStep}>Back</Button>
              <Button onClick={nextStep}>Next</Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3>Review & Submit</h3>
            <div className="space-y-4">
              <div>Review your information before submitting.</div>
              <Button onClick={prevStep}>Back</Button>
              <Button variant="primary">Submit</Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
```

## Data Display Patterns

### Data Table

```tsx
function DataTable({ data }: { data: any[] }) {
  const columns = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      sortable: true,
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      sortable: true,
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'success' : 'warning'}>
          {value}
        </Badge>
      ),
    },
  ];

  return (
    <Card>
      <Table
        data={data}
        columns={columns}
        pagination={{
          current: 1,
          pageSize: 10,
          total: data.length,
          onChange: (page) => console.log('Page changed to:', page),
        }}
      />
    </Card>
  );
}
```

### Stats Display

```tsx
function StatsDisplay() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="Total Users"
        value="1,234"
        change={12.5}
        changeType="percentage"
        icon={<FiUsers />}
      />
      
      <StatCard
        title="Revenue"
        value="$45,678"
        change={8.2}
        changeType="percentage"
        icon={<FiDollarSign />}
      />
      
      <StatCard
        title="Active Sessions"
        value="892"
        change={-2.4}
        changeType="percentage"
        icon={<FiActivity />}
      />
      
      <StatCard
        title="Conversion Rate"
        value="3.2%"
        change={0.5}
        changeType="percentage"
        icon={<FiTrendingUp />}
      />
    </div>
  );
}
```

### Progress Indicators

```tsx
function ProgressIndicators() {
  return (
    <Stack direction="vertical" spacing="lg">
      {/* Linear progress */}
      <Progress value={75} showLabel label="Profile Completion" />
      
      {/* Circular progress */}
      <div className="flex items-center gap-4">
        <Progress value={60} variant="circular" size="lg" />
        <div>
          <div className="font-semibold">60%</div>
          <div className="text-sm text-gray-600">Complete</div>
        </div>
      </div>
      
      {/* Striped progress */}
      <Progress value={40} striped animated label="Loading..." />
      
      {/* Different variants */}
      <Progress value={90} variant="success" label="Success" />
      <Progress value={30} variant="warning" label="Warning" />
      <Progress value={20} variant="error" label="Error" />
    </Stack>
  );
}
```

## Advanced Patterns

### Modal with Form

```tsx
function ModalWithForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New User"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <Stack direction="vertical" spacing="lg">
            <Input label="Name" placeholder="Enter name" />
            <Input label="Email" type="email" placeholder="Enter email" />
            <Select label="Role" options={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
            ]} />
          </Stack>
          
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
```

### Dropdown with Actions

```tsx
function ActionDropdown() {
  const [selectedAction, setSelectedAction] = useState('');

  const handleAction = (action: string) => {
    setSelectedAction(action);
    // Handle the action
    console.log('Action selected:', action);
  };

  const items = [
    {
      key: 'edit',
      label: 'Edit',
      icon: <FiEdit />,
      onClick: () => handleAction('edit'),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <FiTrash />,
      onClick: () => handleAction('delete'),
      danger: true,
    },
    {
      key: 'share',
      label: 'Share',
      icon: <FiShare />,
      onClick: () => handleAction('share'),
    },
  ];

  return (
    <Dropdown
      trigger={<Button>Actions <FiChevronDown className="ml-2" /></Button>}
      items={items}
      position="bottom-right"
    />
  );
}
```

### Tabs with Content

```tsx
function TabbedInterface() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <Card>
      <Tabs
        defaultActiveId="profile"
        onTabChange={(tabId) => setActiveTab(tabId)}
      >
        <Tabs.Tab id="profile" label="Profile" badge="3">
          <div className="p-4">
            <h3>Profile Information</h3>
            <p>User profile details and settings.</p>
          </div>
        </Tabs.Tab>
        
        <Tabs.Tab id="security" label="Security">
          <div className="p-4">
            <h3>Security Settings</h3>
            <p>Password, two-factor authentication, and security options.</p>
          </div>
        </Tabs.Tab>
        
        <Tabs.Tab id="notifications" label="Notifications" disabled>
          <div className="p-4">
            <h3>Notification Preferences</h3>
            <p>Email, push, and SMS notification settings.</p>
          </div>
        </Tabs.Tab>
      </Tabs>
    </Card>
  );
}
```

## Performance Tips

### Optimizing Re-renders

```tsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* expensive rendering */}</div>;
});

// Use useMemo for expensive calculations
const ExpensiveList = ({ items }) => {
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  return <div>Total: {expensiveValue}</div>;
};

// Use useCallback for event handlers
const OptimizedComponent = ({ onItemClick }) => {
  const handleClick = useCallback((item) => {
    onItemClick(item);
  }, [onItemClick]);

  return <button onClick={handleClick}>Click me</button>;
};
```

### Lazy Loading

```tsx
// Lazy load components with React.lazy
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}
```

### Bundle Optimization

```tsx
// Dynamic imports for code splitting
const loadComponent = (componentName: string) => {
  return import(`./components/${componentName}`);
};

// Use dynamic imports in Next.js
const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading component...</div>,
  ssr: false,
});
```

## Best Practices

### 1. Consistent Spacing

```tsx
// Use Stack for consistent spacing
<Stack direction="vertical" spacing="md">
  <Input label="Field 1" />
  <Input label="Field 2" />
  <Input label="Field 3" />
</Stack>

// Instead of manual spacing
<div className="space-y-4">
  <Input label="Field 1" />
  <div className="mt-4">
    <Input label="Field 2" />
  </div>
  <div className="mt-4">
    <Input label="Field 3" />
  </div>
</div>
```

### 2. Semantic HTML

```tsx
// Use semantic elements
<Card>
  <h2>Card Title</h2> {/* Use h2 instead of div with font-bold */}
  <p>Card description</p>        {/* Use p for text content */}
  <Button>Call to Action</Button>   {/* Use button for actions */}
</Card>

// Use proper ARIA attributes
<button 
  aria-label="Close dialog" 
  aria-expanded={isOpen}
  aria-controls="dialog-id"
>
  Close
</button>
```

### 3. Responsive Design

```tsx
// Use responsive grid
<Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="md">
  <div>Responsive item 1</div>
  <div>Responsive item 2</div>
  <div>Responsive item 3</div>
</Grid>

// Use responsive containers
<Container size="sm">Mobile layout</Container>
<Container size="lg">Desktop layout</Container>

// Use responsive text
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

### 4. Error Handling

```tsx
// Use ErrorBoundary for error handling
<ErrorBoundary
  fallback={
    <div className="p-4 text-center">
      <h2>Something went wrong</h2>
      <p>Please refresh the page and try again.</p>
      <Button onClick={() => window.location.reload()}>
        Refresh
      </Button>
    </div>
  }
>
  <YourComponent />
</ErrorBoundary>

// Show error states
{error && (
  <ErrorState
    title="Error Occurred"
    message={error.message}
    variant="default"
    onRetry={() => setError(null)}
  />
)}
```

### 5. Loading States

```tsx
// Use skeleton for loading states
{loading ? (
  <Stack direction="vertical" spacing="md">
    <Skeleton variant="text" lines={3} />
    <Skeleton variant="button" />
    <Skeleton variant="avatar" />
  </Stack>
) : (
  <div>Actual content</div>
)}

// Use loading states on buttons
<Button loading={isSubmitting} disabled={isSubmitting}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</Button>
```

## Troubleshooting

### Common Issues

1. **Components not rendering**: Check imports and export paths
2. **Styling not applying**: Ensure CSS variables are defined
3. **TypeScript errors**: Verify prop types and interfaces
4. **Performance issues**: Use React DevTools Profiler
5. **Accessibility problems**: Test with screen readers

### Debug Tips

```tsx
// Add debug props for development
<Component debug={process.env.NODE_ENV === 'development'} />

// Use console logging for debugging
useEffect(() => {
  console.log('Component mounted with props:', props);
}, [props]);
```

This cookbook provides a comprehensive guide for using the UI Design System effectively. For more detailed information about each component, refer to their individual documentation.
