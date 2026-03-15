"use client";

import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Checkbox, 
  Badge,
  Pagination,
  Avatar,
  Card,
  Container,
  Stack,
  useToast
} from '@/components/ui';
import type { Column } from '@/components/ui/Table';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  lastLogin: string;
}

interface DataTableExampleProps {
  users: User[];
  onUserEdit: (user: User) => void;
  onUserDelete: (userId: string) => void;
  onStatusChange: (userId: string, status: User['status']) => void;
}

export default function DataTableExample({ 
  users, 
  onUserEdit, 
  onUserDelete, 
  onStatusChange 
}: DataTableExampleProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { addToast } = useToast();

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pageSize = 10;
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      addToast({
        type: 'warning',
        title: 'No users selected',
        message: 'Please select at least one user to delete.',
      });
      return;
    }

    selectedUsers.forEach(userId => {
      onUserDelete(userId);
    });

    addToast({
      type: 'success',
      title: 'Users deleted',
      message: `${selectedUsers.length} user(s) deleted successfully.`,
    });

    setSelectedUsers([]);
  };

  const handleBulkStatusChange = (status: User['status']) => {
    if (selectedUsers.length === 0) {
      addToast({
        type: 'warning',
        title: 'No users selected',
        message: 'Please select at least one user to update status.',
      });
      return;
    }

    selectedUsers.forEach(userId => {
      onStatusChange(userId, status);
    });

    addToast({
      type: 'success',
      title: 'Status updated',
      message: `${selectedUsers.length} user(s) status updated to ${status}.`,
    });

    setSelectedUsers([]);
  };

  const columns: Column<User>[] = [
    {
      key: 'avatar',
      title: '',
      dataIndex: 'avatar' as keyof User,
      width: '60px',
      render: (value: string, record: User) => (
        <Avatar 
          src={record.avatar} 
          fallback={record.name}
          size="sm"
          status={record.status === 'active' ? 'online' : 'offline'}
          showStatus
        />
      ),
    },
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name' as keyof User,
      sortable: true,
      render: (value: string, record: User) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{value}</span>
          {record.status === 'pending' && (
            <Badge variant="warning" size="sm">Pending</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email' as keyof User,
      sortable: true,
    },
    {
      key: 'role',
      title: 'Role',
      dataIndex: 'role' as keyof User,
      sortable: true,
      render: (value: string) => (
        <Badge 
          variant={value === 'admin' ? 'primary' : 'secondary'}
          size="sm"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status' as keyof User,
      sortable: true,
      render: (value: User['status']) => (
        <Badge 
          variant={
            value === 'active' ? 'success' : 
            value === 'inactive' ? 'error' : 'warning'
          }
          size="sm"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      dataIndex: 'lastLogin' as keyof User,
      sortable: true,
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id' as keyof User,
      render: (value: any, record: User) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUserEdit(record)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onUserDelete(record.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Container size="xl">
      <Stack spacing="lg">
        {/* Header */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-[var(--coffee-charcoal)]">
                User Management
              </h1>
              
              <div className="text-sm text-gray-600">
                {filteredUsers.length} users found
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mb-6">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<span>🔍</span>}
                className="w-64"
              />

              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'pending', label: 'Pending' },
                ]}
                placeholder="Filter by status"
                className="w-48"
              />

              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange('active')}
                  >
                    Activate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange('inactive')}
                  >
                    Deactivate
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    Delete ({selectedUsers.length})
                  </Button>
                </div>
              )}
            </div>

            {/* Bulk Actions */}
            <div className="flex items-center gap-4 p-4 bg-[var(--coffee-cream)] border-radius">
              <Checkbox
                label="Select all"
                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                onChange={handleSelectAll}
              />
              
              <span className="text-sm text-gray-600">
                {selectedUsers.length} of {filteredUsers.length} selected
              </span>
            </div>
          </div>
        </Card>

        {/* Data Table */}
        <Card>
          <Table
            data={paginatedUsers}
            columns={columns}
            onRowClick={(record) => onUserEdit(record)}
            pagination={{
              current: currentPage,
              pageSize,
              total: filteredUsers.length,
              onChange: setCurrentPage,
            }}
            loading={false}
            striped
            bordered
          />
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-600 mb-2">Total Users</div>
              <div className="text-2xl font-bold text-[var(--coffee-charcoal)]">
                {users.length}
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-600 mb-2">Active Users</div>
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'active').length}
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-600 mb-2">Pending Users</div>
              <div className="text-2xl font-bold text-yellow-600">
                {users.filter(u => u.status === 'pending').length}
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-600 mb-2">Inactive Users</div>
              <div className="text-2xl font-bold text-red-600">
                {users.filter(u => u.status === 'inactive').length}
              </div>
            </div>
          </Card>
        </div>
      </Stack>
    </Container>
  );
}
