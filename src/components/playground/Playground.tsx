"use client";

import React, { useState } from 'react';
import { 
  Button, Input, Modal, Card, CardHeader, CardContent, Avatar, 
  Spinner, Badge, Tooltip, Dropdown, 
  Skeleton, EmptyState, ErrorState,
  Container, Grid, Stack, Tabs, Table,
  ThemeToggle
} from '@/components/ui';

export default function ComponentPlayground() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleShowToast = () => {
    // This would use the toast system
    console.log('Toast would be shown here');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setShowModal(false);
      handleShowToast();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Container size="lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--coffee-charcoal)] mb-6">
            UI Design System Playground
          </h1>
          <p className="text-[var(--coffee-macchiato)] mb-8">
            Interactive playground for all UI components
          </p>
        </div>

        <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap="lg">
          {/* Basic Components */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--coffee-charcoal)]">Basic Components</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-md font-medium text-[var(--coffee-charcoal)]">Buttons</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button loading>Loading</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-[--coffee-charcoal)]">Inputs</h3>
                <div className="space-y-3">
                  <Input label="Text Input" placeholder="Enter text..." />
                  <Input label="Email Input" type="email" placeholder="Enter email..." />
                  <Input 
                    label="Input with Error" 
                    placeholder="Enter text..." 
                    error="This field is required"
                    helperText="Please enter a valid value"
                  />
                  <Input 
                    label="Input with Icon" 
                    placeholder="Search..." 
                    leftIcon={<span>🔍</span>}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-[--coffee-charcoal)]">Avatars</h3>
                <div className="flex gap-4 items-end">
                  <Avatar src="https://picsum.photos/seed/user1" alt="User 1" size="sm" />
                  <Avatar fallback="John Doe" size="md" />
                  <Avatar src="https://picsum.photos/seed/user2" alt="User 2" size="lg" status="online" showStatus />
                  <Avatar fallback="JD" variant="square" size="xl" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-[--coffee-charcoal)]">Badges</h3>
                <div className="flex gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Components */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--coffee-charcoal)]">Advanced Components</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-md font-medium text-[--coffee-charcoal)]">Spinners</h3>
                <div className="flex gap-2">
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                  <Spinner variant="dots" />
                  <Spinner variant="pulse" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-[--coffee-charcoal)]">Skeletons</h3>
                <div className="space-y-4">
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" lines={3} />
                  <Skeleton variant="circular" />
                  <Skeleton variant="avatar" />
                  <Skeleton variant="button" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Layout Components */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[--coffee-charcoal)]">Layout Components</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-md font-medium text-[--coffee-charcoal)]">Container</h3>
                <Container size="sm" className="bg-[var(--coffee-cream)] p-4">
                  <p>Small Container</p>
                </Container>
                <Container size="md" className="bg-[var(--coffee-cream)] p-6">
                  <p>Medium Container</p>
                </Container>
                <Container size="lg" className="bg-[var(--coffee-cream)] p-8">
                  <p>Large Container</p>
                </Container>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-[--coffee-charcoal)]">Grid Layout</h3>
                <Grid cols={3} gap="md">
                  <div className="bg-[var(--coffee-cream)] p-4 border-radius">1</div>
                  <div className="bg-[var(--coffee-cream)] p-4 border-radius">2</div>
                  <div className="bg-[var(--coffee-cream)] p-4 border-radius">3</div>
                </Grid>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-[--coffee-charcoal)]">Stack Layout</h3>
                <Stack direction="vertical" spacing="md">
                  <div className="bg-[var(--coffee-cream)] p-4 border-radius">Item 1</div>
                  <div className="bg-[var(--coffee-cream)] p-4 border-radius">Item 2</div>
                  <div className="bg-[var(--coffee-cream)] p-4 border-radius">Item 3</div>
                </Stack>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Components */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[--coffee-charcoal)]">Interactive Components</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-md font-medium text-[--coffee-charcoal)]">Tabs</h3>
                <Tabs defaultActiveId="tab1">
                  {(Tabs as any).Tab({ id: 'tab1', label: 'Tab 1', badge: '5', children: 'Content 1' })}
                  {(Tabs as any).Tab({ id: 'tab2', label: 'Tab 2', icon: <span>📄</span>, children: 'Content 2' })}
                  {(Tabs as any).Tab({ id: 'tab3', label: 'Tab 3', disabled: true, children: 'Content 3' })}
                </Tabs>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-[--coffee-charcoal)]">Dropdown</h3>
                <Dropdown
                  trigger={<Button>Menu</Button>}
                  items={[
                    { key: 'profile', label: 'Profile', icon: <span>👤</span> },
                    { key: 'settings', label: 'Settings', icon: <span>⚙️</span> },
                    { key: 'logout', label: 'Logout', icon: <span>🚪</span>, danger: true },
                  ]}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-[--coffee-charcoal)]">Theme Toggle</h3>
                <ThemeToggle size="lg" showLabel />
              </div>
            </CardContent>
          </Card>

          {/* Form Example */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[--coffee-char0)]">Form Example</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <Input label="Message" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : 'Submit'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowModal(true)}>
                    Open Modal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* State Components */}
        <Grid cols={{ sm: 1, lg: 2 }} gap="lg">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[--coffee-charcoal)]">State Components</h2>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<span>📭</span>}
                title="No Data Available"
                description="Try adjusting your search criteria"
                action={<Button variant="primary">Refresh</Button>}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[--coffee-charcoal)]">Loading States</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton variant="text" lines={3} />
                <Skeleton variant="button" />
                <Skeleton variant="avatar" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[--coffee-charcoal)]">Error States</h2>
            </CardHeader>
            <CardContent>
              <ErrorState
                title="Something went wrong"
                message="Please try again later"
                variant="default"
                onRetry={() => console.log('Retry clicked')}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Modal */}
        <Modal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Form Submitted"
          size="md"
        >
          <div className="text-center py-8">
            <div className="text-green-600 text-lg mb-4">✓</div>
            <h3 className="text-lg font-semibold text-[var(--coffee-charcoal)]">Success!</h3>
            <p className="text-[var(--coffee-macchiato)]">Your form has been submitted successfully.</p>
            <Button onClick={() => setShowModal(false)} className="mt-4">
              Close
            </Button>
          </div>
        </Modal>
      </Container>
    </div>
  );
}
