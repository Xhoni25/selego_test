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
  Progress,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  DollarSign,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { Team, CreateTeamRequest } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const Teams: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const queryClient = useQueryClient();

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => api.get<Team[]>('/teams'),
  });

  const createTeamMutation = useMutation({
    mutationFn: (data: CreateTeamRequest) => api.post<Team>('/teams', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsCreateModalOpen(false);
      toast.success('Team created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create team');
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: (data: { id: string; name: string; budget: number }) =>
      api.put<Team>(`/teams/${data.id}`, {
        name: data.name,
        budget: data.budget,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsEditModalOpen(false);
      setSelectedTeam(null);
      toast.success('Team updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update team');
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/teams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsDeleteDialogOpen(false);
      setSelectedTeam(null);
      toast.success('Team deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete team');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTeamRequest>();

  const teamsData = teams?.data || [];
  const filteredTeams = teamsData.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTeam = (data: CreateTeamRequest): void => {
    createTeamMutation.mutate(data);
  };

  const handleEditTeam = (team: Team): void => {
    setSelectedTeam(team);
    setIsEditModalOpen(true);
  };

  const handleUpdateTeam = (data: CreateTeamRequest): void => {
    if (selectedTeam) {
      updateTeamMutation.mutate({
        id: selectedTeam._id,
        name: data.name,
        budget: data.budget,
      });
    }
  };

  const handleDeleteTeam = (team: Team): void => {
    setSelectedTeam(team);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = (): void => {
    if (selectedTeam) {
      deleteTeamMutation.mutate(selectedTeam._id);
    }
  };

  const getBudgetColor = (
    utilization: number
  ): 'success' | 'warning' | 'danger' => {
    if (utilization >= 100) return 'danger';
    if (utilization >= 80) return 'warning';
    return 'success';
  };

  if (isLoading) {
    return <LoadingSpinner size='lg' label='Loading teams...' />;
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          Teams
        </h1>
        <Button
          color='primary'
          startContent={<Plus size={20} />}
          onPress={() => setIsCreateModalOpen(true)}
        >
          Create Team
        </Button>
      </div>

      {/* Search */}
      <div className='max-w-md'>
        <Input
          placeholder='Search teams...'
          value={searchTerm}
          onValueChange={setSearchTerm}
          startContent={<Users size={20} />}
        />
      </div>

      {/* Teams List */}
      {filteredTeams.length === 0 ? (
        <EmptyState
          message={
            searchTerm ? 'No teams found matching your search' : 'No teams yet'
          }
          action={
            <Button
              color='primary'
              startContent={<Plus size={16} />}
              onPress={() => setIsCreateModalOpen(true)}
            >
              Create Your First Team
            </Button>
          }
        />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredTeams.map(team => (
            <Card key={team._id} className='hover:shadow-lg transition-shadow'>
              <CardHeader className='flex justify-between items-start'>
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    {team.name}
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {team.members.length} member
                    {team.members.length !== 1 ? 's' : ''}
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
                      onPress={() => handleEditTeam(team)}
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      key='delete'
                      color='danger'
                      startContent={<Trash2 size={16} />}
                      onPress={() => handleDeleteTeam(team)}
                    >
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </CardHeader>
              <CardBody>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      Budget
                    </span>
                    <span className='font-medium text-gray-900 dark:text-white'>
                      ${team.budget.toLocaleString()}
                    </span>
                  </div>

                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      Spent
                    </span>
                    <span className='font-medium text-gray-900 dark:text-white'>
                      ${team.total_spent.toLocaleString()}
                    </span>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-gray-600 dark:text-gray-400'>
                        Utilization
                      </span>
                      <Chip
                        color={getBudgetColor(team.budget_utilization || 0)}
                        size='sm'
                      >
                        {(team.budget_utilization || 0).toFixed(1)}%
                      </Chip>
                    </div>
                    <Progress
                      value={team.budget_utilization || 0}
                      color={getBudgetColor(team.budget_utilization || 0)}
                      className='w-full'
                    />
                  </div>

                  {team.is_over_budget && (
                    <Chip
                      color='danger'
                      size='sm'
                      className='w-full justify-center'
                    >
                      Over Budget
                    </Chip>
                  )}
                  {team.is_near_budget && !team.is_over_budget && (
                    <Chip
                      color='warning'
                      size='sm'
                      className='w-full justify-center'
                    >
                      Near Budget Limit
                    </Chip>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
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
                <h3 className='text-lg font-semibold'>Create New Team</h3>
              </ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit(handleCreateTeam)}
                  className='space-y-4'
                >
                  <Input
                    {...register('name', {
                      required: 'Team name is required',
                      minLength: {
                        value: 2,
                        message: 'Team name must be at least 2 characters',
                      },
                    })}
                    label='Team Name'
                    placeholder='Enter team name'
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                  />

                  <Input
                    {...register('budget', {
                      required: 'Budget is required',
                      min: {
                        value: 0,
                        message: 'Budget must be a positive number',
                      },
                    })}
                    type='number'
                    label='Budget'
                    placeholder='Enter budget amount'
                    startContent={<DollarSign size={20} />}
                    isInvalid={!!errors.budget}
                    errorMessage={errors.budget?.message}
                  />
                </form>
              </ModalBody>
              <ModalFooter>
                <Button color='default' variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  onPress={() => handleSubmit(handleCreateTeam)()}
                  isLoading={createTeamMutation.isPending}
                >
                  Create Team
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Team Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTeam(null);
          reset();
        }}
        size='md'
      >
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader>
                <h3 className='text-lg font-semibold'>Edit Team</h3>
              </ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit(handleUpdateTeam)}
                  className='space-y-4'
                >
                  <Input
                    {...register('name', { required: 'Team name is required' })}
                    label='Team Name'
                    placeholder='Enter team name'
                    errorMessage={errors.name?.message}
                    defaultValue={selectedTeam?.name || ''}
                  />
                  <Input
                    {...register('budget', {
                      required: 'Budget is required',
                      min: { value: 0, message: 'Budget must be positive' },
                    })}
                    label='Budget'
                    type='number'
                    placeholder='Enter budget amount'
                    errorMessage={errors.budget?.message}
                    defaultValue={selectedTeam?.budget?.toString() || ''}
                  />
                </form>
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  onPress={() => handleSubmit(handleUpdateTeam)()}
                  isLoading={updateTeamMutation.isPending}
                >
                  Update Team
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
          setSelectedTeam(null);
        }}
        onConfirm={confirmDelete}
        title='Delete Team'
        message={`Are you sure you want to delete "${selectedTeam?.name}"? This action cannot be undone and will also delete all associated expenses.`}
        confirmText='Delete'
        confirmColor='danger'
        isLoading={deleteTeamMutation.isPending}
      />
    </div>
  );
};

export default Teams;
