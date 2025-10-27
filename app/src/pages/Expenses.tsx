import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Select,
  SelectItem,
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Progress,
} from '@nextui-org/react';
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Receipt,
  DollarSign,
  FileText,
  X,
  BarChart3,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { Expense, CreateExpenseRequest, Team, ExpenseCategory } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const Expenses: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'charts'>(
    'table'
  );

  const queryClient = useQueryClient();

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: [
      'expenses',
      { team: selectedTeam, category: selectedCategory, search: searchTerm },
    ],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedTeam) params.append('team_id', selectedTeam);
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      return api.get<{ expenses: Expense[] }>(`/expenses?${params.toString()}`);
    },
  });

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => api.get<Team[]>('/teams'),
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: CreateExpenseRequest) => {
      const response = await api.post<Expense>('/expenses', data);
      if (!response.ok) {
        throw new Error(response.message || 'Failed to create expense');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsCreateModalOpen(false);
      toast.success('Expense created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create expense');
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateExpenseRequest>;
    }) => {
      const response = await api.put<Expense>(`/expenses/${id}`, data);
      if (!response.ok) {
        throw new Error(response.message || 'Failed to update expense');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsEditModalOpen(false);
      setSelectedExpense(null);
      toast.success('Expense updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update expense');
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/expenses/${id}`);
      if (!response.ok) {
        throw new Error(response.message || 'Failed to delete expense');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsDeleteDialogOpen(false);
      setSelectedExpense(null);
      toast.success('Expense deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete expense');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateExpenseRequest>();

  const expensesData = expenses?.data?.expenses || [];
  const teamsData = teams?.data || [];

  const categories: ExpenseCategory[] = [
    'travel',
    'food',
    'supplies',
    'software',
    'marketing',
    'office',
    'other',
  ];

  const handleCreateExpense = (data: CreateExpenseRequest): void => {
    createExpenseMutation.mutate(data);
  };

  const handleEditExpense = (expense: Expense): void => {
    setSelectedExpense(expense);
    setValue('amount', expense.amount);
    setValue('description', expense.description);
    setValue('category', expense.category);
    setValue('notes', expense.notes || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateExpense = (data: CreateExpenseRequest): void => {
    if (selectedExpense) {
      updateExpenseMutation.mutate({ id: selectedExpense._id, data });
    }
  };

  const handleDeleteExpense = (expense: Expense): void => {
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = (): void => {
    if (selectedExpense) {
      deleteExpenseMutation.mutate(selectedExpense._id);
    }
  };

  const clearFilters = (): void => {
    setSearchTerm('');
    setSelectedTeam('');
    setSelectedCategory('');
  };

  const hasActiveFilters = searchTerm || selectedTeam || selectedCategory;

  // Data visualization helpers
  const getExpenseStats = () => {
    const totalAmount = expensesData.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const categoryBreakdown = expensesData.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const teamBreakdown = expensesData.reduce((acc, expense) => {
      const teamName =
        typeof expense.team_id === 'object' ? expense.team_id.name : 'Unknown';
      acc[teamName] = (acc[teamName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return { totalAmount, categoryBreakdown, teamBreakdown };
  };

  const getCategoryColor = (
    category: ExpenseCategory
  ): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' => {
    const colors = {
      travel: 'primary' as const,
      food: 'success' as const,
      supplies: 'secondary' as const,
      software: 'warning' as const,
      marketing: 'danger' as const,
      office: 'default' as const,
      other: 'default' as const,
    };
    return colors[category];
  };

  if (expensesLoading) {
    return <LoadingSpinner size='lg' label='Loading expenses...' />;
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          Expenses
        </h1>
        <Button
          color='primary'
          startContent={<Plus size={20} />}
          onPress={() => setIsCreateModalOpen(true)}
        >
          Add Expense
        </Button>
      </div>

      {/* Filters and View Controls */}
      <div className='space-y-4'>
        <div className='flex flex-wrap gap-4 items-center'>
          <div className='min-w-64'>
            <Input
              placeholder='Search expenses...'
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<Receipt size={20} />}
            />
          </div>

          <div className='min-w-48'>
            <Select
              placeholder='Filter by team'
              selectedKeys={selectedTeam ? [selectedTeam] : []}
              onSelectionChange={keys =>
                setSelectedTeam((Array.from(keys)[0] as string) || '')
              }
            >
              {teamsData.map(team => (
                <SelectItem key={team._id} value={team._id}>
                  {team.name}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className='min-w-48'>
            <Select
              placeholder='Filter by category'
              selectedKeys={selectedCategory ? [selectedCategory] : []}
              onSelectionChange={keys =>
                setSelectedCategory((Array.from(keys)[0] as string) || '')
              }
            >
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              color='danger'
              variant='light'
              startContent={<X size={16} />}
              onPress={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className='flex justify-between items-center'>
          <div className='flex gap-2'>
            <Button
              color={viewMode === 'table' ? 'primary' : 'default'}
              variant={viewMode === 'table' ? 'solid' : 'light'}
              size='sm'
              startContent={<Receipt size={16} />}
              onPress={() => setViewMode('table')}
            >
              Table
            </Button>
            <Button
              color={viewMode === 'cards' ? 'primary' : 'default'}
              variant={viewMode === 'cards' ? 'solid' : 'light'}
              size='sm'
              startContent={<FileText size={16} />}
              onPress={() => setViewMode('cards')}
            >
              Cards
            </Button>
            <Button
              color={viewMode === 'charts' ? 'primary' : 'default'}
              variant={viewMode === 'charts' ? 'solid' : 'light'}
              size='sm'
              startContent={<BarChart3 size={16} />}
              onPress={() => setViewMode('charts')}
            >
              Charts
            </Button>
          </div>

          {hasActiveFilters && (
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              {expensesData.length} expense
              {expensesData.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      </div>

      {/* Expenses Display */}
      {expensesData.length === 0 ? (
        <EmptyState
          message='No expenses found'
          action={
            <Button
              color='primary'
              startContent={<Plus size={16} />}
              onPress={() => setIsCreateModalOpen(true)}
            >
              Add Your First Expense
            </Button>
          }
        />
      ) : (
        <>
          {viewMode === 'table' && (
            <Card>
              <CardBody className='p-0'>
                <Table aria-label='Expenses table'>
                  <TableHeader>
                    <TableColumn>DESCRIPTION</TableColumn>
                    <TableColumn>TEAM</TableColumn>
                    <TableColumn>AMOUNT</TableColumn>
                    <TableColumn>CATEGORY</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {expensesData.map(expense => (
                      <TableRow key={expense._id}>
                        <TableCell>
                          <div>
                            <p className='font-medium text-gray-900 dark:text-white'>
                              {expense.description}
                            </p>
                            {expense.notes && (
                              <p className='text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs'>
                                {expense.notes}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className='text-sm text-gray-600 dark:text-gray-400'>
                            {typeof expense.team_id === 'object'
                              ? expense.team_id.name
                              : 'Unknown Team'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className='font-medium text-gray-900 dark:text-white'>
                            ${expense.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={getCategoryColor(expense.category)}
                            size='sm'
                            variant='flat'
                          >
                            {expense.category.charAt(0).toUpperCase() +
                              expense.category.slice(1)}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={expense.status} />
                        </TableCell>
                        <TableCell>
                          <span className='text-sm text-gray-600 dark:text-gray-400'>
                            {new Date(
                              expense.expense_date
                            ).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly variant='light' size='sm'>
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                              <DropdownItem
                                key='edit'
                                startContent={<Edit size={16} />}
                                onPress={() => handleEditExpense(expense)}
                              >
                                Edit
                              </DropdownItem>
                              <DropdownItem
                                key='delete'
                                color='danger'
                                startContent={<Trash2 size={16} />}
                                onPress={() => handleDeleteExpense(expense)}
                              >
                                Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          )}

          {viewMode === 'cards' && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {expensesData.map(expense => (
                <Card
                  key={expense._id}
                  className='hover:shadow-lg transition-shadow'
                >
                  <CardBody className='p-4'>
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex-1'>
                        <h3 className='font-semibold text-lg text-gray-900 dark:text-white truncate'>
                          {expense.description}
                        </h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          {typeof expense.team_id === 'object'
                            ? expense.team_id.name
                            : 'Unknown Team'}
                        </p>
                      </div>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly variant='light' size='sm'>
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key='edit'
                            startContent={<Edit size={16} />}
                            onPress={() => handleEditExpense(expense)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key='delete'
                            color='danger'
                            startContent={<Trash2 size={16} />}
                            onPress={() => handleDeleteExpense(expense)}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex justify-between items-center'>
                        <span className='text-2xl font-bold text-gray-900 dark:text-white'>
                          ${expense.amount.toLocaleString()}
                        </span>
                        <StatusBadge status={expense.status} />
                      </div>

                      <div className='flex justify-between items-center'>
                        <Chip
                          color={getCategoryColor(expense.category)}
                          size='sm'
                          variant='flat'
                        >
                          {expense.category.charAt(0).toUpperCase() +
                            expense.category.slice(1)}
                        </Chip>
                        <span className='text-sm text-gray-600 dark:text-gray-400'>
                          {new Date(expense.expense_date).toLocaleDateString()}
                        </span>
                      </div>

                      {expense.notes && (
                        <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2'>
                          {expense.notes}
                        </p>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {viewMode === 'charts' && (
            <div className='space-y-6'>
              {/* Summary Cards */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Card>
                  <CardBody className='p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-primary-100 dark:bg-primary-900 rounded-lg'>
                        <DollarSign className='w-6 h-6 text-primary-600 dark:text-primary-400' />
                      </div>
                      <div>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          Total Amount
                        </p>
                        <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                          ${getExpenseStats().totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className='p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-success-100 dark:bg-success-900 rounded-lg'>
                        <Receipt className='w-6 h-6 text-success-600 dark:text-success-400' />
                      </div>
                      <div>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          Total Expenses
                        </p>
                        <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                          {expensesData.length}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className='p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-warning-100 dark:bg-warning-900 rounded-lg'>
                        <TrendingUp className='w-6 h-6 text-warning-600 dark:text-warning-400' />
                      </div>
                      <div>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          Average
                        </p>
                        <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                          $
                          {expensesData.length > 0
                            ? (
                                getExpenseStats().totalAmount /
                                expensesData.length
                              ).toFixed(0)
                            : 0}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
                    <PieChart className='w-5 h-5' />
                    Expenses by Category
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className='space-y-3'>
                    {Object.entries(getExpenseStats().categoryBreakdown).map(
                      ([category, amount]) => {
                        const percentage =
                          (amount / getExpenseStats().totalAmount) * 100;
                        return (
                          <div key={category} className='space-y-1'>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm font-medium text-gray-900 dark:text-white capitalize'>
                                {category}
                              </span>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                ${amount.toLocaleString()} (
                                {percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress
                              value={percentage}
                              color={getCategoryColor(
                                category as ExpenseCategory
                              )}
                              className='w-full'
                            />
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Team Breakdown */}
              <Card>
                <CardHeader>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
                    <BarChart3 className='w-5 h-5' />
                    Expenses by Team
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className='space-y-3'>
                    {Object.entries(getExpenseStats().teamBreakdown).map(
                      ([team, amount]) => {
                        const percentage =
                          (amount / getExpenseStats().totalAmount) * 100;
                        return (
                          <div key={team} className='space-y-1'>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm font-medium text-gray-900 dark:text-white'>
                                {team}
                              </span>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                ${amount.toLocaleString()} (
                                {percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress
                              value={percentage}
                              color='primary'
                              className='w-full'
                            />
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Create Expense Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          reset();
        }}
        size='md'
      >
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader>
                <h3 className='text-lg font-semibold'>Add New Expense</h3>
              </ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit(handleCreateExpense)}
                  className='space-y-4'
                >
                  <Select
                    {...register('team_id', { required: 'Team is required' })}
                    label='Team'
                    placeholder='Select a team'
                    isInvalid={!!errors.team_id}
                    errorMessage={errors.team_id?.message}
                  >
                    {teamsData.map(team => (
                      <SelectItem key={team._id} value={team._id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    {...register('amount', {
                      required: 'Amount is required',
                      min: {
                        value: 0.01,
                        message: 'Amount must be greater than 0',
                      },
                    })}
                    type='number'
                    step='0.01'
                    label='Amount'
                    placeholder='Enter amount'
                    startContent={<DollarSign size={20} />}
                    isInvalid={!!errors.amount}
                    errorMessage={errors.amount?.message}
                  />

                  <Input
                    {...register('description', {
                      required: 'Description is required',
                      minLength: {
                        value: 2,
                        message: 'Description must be at least 2 characters',
                      },
                    })}
                    label='Description'
                    placeholder='Enter description'
                    startContent={<FileText size={20} />}
                    isInvalid={!!errors.description}
                    errorMessage={errors.description?.message}
                  />

                  <Select
                    {...register('category')}
                    label='Category'
                    placeholder='Select category (optional)'
                  >
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </Select>

                  <Textarea
                    {...register('notes')}
                    label='Notes'
                    placeholder='Additional notes (optional)'
                    minRows={2}
                  />
                </form>
              </ModalBody>
              <ModalFooter>
                <Button color='default' variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  onPress={() => handleSubmit(handleCreateExpense)()}
                  isLoading={createExpenseMutation.isPending}
                >
                  Add Expense
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedExpense(null);
          reset();
        }}
        size='md'
      >
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader>
                <h3 className='text-lg font-semibold'>Edit Expense</h3>
              </ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit(handleUpdateExpense)}
                  className='space-y-4'
                >
                  <Input
                    {...register('amount', {
                      required: 'Amount is required',
                      min: {
                        value: 0.01,
                        message: 'Amount must be greater than 0',
                      },
                    })}
                    type='number'
                    step='0.01'
                    label='Amount'
                    placeholder='Enter amount'
                    startContent={<DollarSign size={20} />}
                    isInvalid={!!errors.amount}
                    errorMessage={errors.amount?.message}
                  />

                  <Input
                    {...register('description', {
                      required: 'Description is required',
                      minLength: {
                        value: 2,
                        message: 'Description must be at least 2 characters',
                      },
                    })}
                    label='Description'
                    placeholder='Enter description'
                    startContent={<FileText size={20} />}
                    isInvalid={!!errors.description}
                    errorMessage={errors.description?.message}
                  />

                  <Select
                    {...register('category')}
                    label='Category'
                    placeholder='Select category'
                  >
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </Select>

                  <Textarea
                    {...register('notes')}
                    label='Notes'
                    placeholder='Additional notes (optional)'
                    minRows={2}
                  />
                </form>
              </ModalBody>
              <ModalFooter>
                <Button color='default' variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  onPress={() => handleSubmit(handleUpdateExpense)()}
                  isLoading={updateExpenseMutation.isPending}
                >
                  Update Expense
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedExpense(null);
        }}
        onConfirm={confirmDelete}
        title='Delete Expense'
        message={`Are you sure you want to delete "${selectedExpense?.description}"? This action cannot be undone.`}
        confirmText='Delete'
        confirmColor='danger'
        isLoading={deleteExpenseMutation.isPending}
      />
    </div>
  );
};

export default Expenses;
