import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Progress,
} from '@nextui-org/react';
import {
  Plus,
  Receipt,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Team, Expense } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Dashboard: React.FC = () => {
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => api.get<Team[]>('/teams'),
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => api.get<{ expenses: Expense[] }>('/expenses'),
  });

  const isLoading = teamsLoading || expensesLoading;

  if (isLoading) {
    return <LoadingSpinner size='lg' label='Loading dashboard...' />;
  }

  const teamsData = teams?.data || [];
  const expensesData = expenses?.data?.expenses || [];

  const totalBudget = teamsData.reduce((sum, team) => sum + team.budget, 0);
  const totalSpent = teamsData.reduce((sum, team) => sum + team.total_spent, 0);
  const budgetUtilization =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const recentExpenses = expensesData.slice(0, 5);
  const overBudgetTeams = teamsData.filter(team => team.is_over_budget);
  const nearBudgetTeams = teamsData.filter(
    team => team.is_near_budget && !team.is_over_budget
  );

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          Dashboard
        </h1>
        <div className='flex space-x-3'>
          <Button
            as={Link}
            to='/teams'
            color='primary'
            startContent={<Plus size={20} />}
          >
            New Team
          </Button>
          <Button
            as={Link}
            to='/expenses'
            color='secondary'
            startContent={<Plus size={20} />}
          >
            New Expense
          </Button>
        </div>
      </div>

      {/* Budget Overview */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <CardBody className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Total Budget
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  ${totalBudget.toLocaleString()}
                </p>
              </div>
              <DollarSign className='h-8 w-8 text-blue-500' />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Total Spent
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  ${totalSpent.toLocaleString()}
                </p>
              </div>
              <TrendingUp className='h-8 w-8 text-green-500' />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Budget Utilization
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {budgetUtilization.toFixed(1)}%
                </p>
              </div>
              <div className='w-16'>
                <Progress
                  value={budgetUtilization}
                  color={
                    budgetUtilization > 100
                      ? 'danger'
                      : budgetUtilization > 80
                      ? 'warning'
                      : 'success'
                  }
                  className='w-full'
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Alerts */}
      {(overBudgetTeams.length > 0 || nearBudgetTeams.length > 0) && (
        <Card className='border-l-4 border-red-500'>
          <CardHeader>
            <div className='flex items-center space-x-2'>
              <AlertTriangle className='h-5 w-5 text-red-500' />
              <h3 className='text-lg font-semibold text-red-700 dark:text-red-400'>
                Budget Alerts
              </h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className='space-y-2'>
              {overBudgetTeams.map(team => (
                <div
                  key={team._id}
                  className='flex items-center justify-between'
                >
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    {team.name} has exceeded its budget
                  </span>
                  <Chip color='danger' size='sm'>
                    Over Budget
                  </Chip>
                </div>
              ))}
              {nearBudgetTeams.map(team => (
                <div
                  key={team._id}
                  className='flex items-center justify-between'
                >
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    {team.name} is near its budget limit
                  </span>
                  <Chip color='warning' size='sm'>
                    Near Limit
                  </Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Teams Overview */}
        <Card>
          <CardHeader className='flex justify-between items-center'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Teams
            </h3>
            <Button as={Link} to='/teams' size='sm' variant='light'>
              View All
            </Button>
          </CardHeader>
          <CardBody>
            {teamsData.length === 0 ? (
              <EmptyState
                message='No teams yet'
                action={
                  <Button
                    as={Link}
                    to='/teams'
                    color='primary'
                    startContent={<Plus size={16} />}
                  >
                    Create Team
                  </Button>
                }
              />
            ) : (
              <div className='space-y-4'>
                {teamsData.slice(0, 3).map(team => (
                  <div
                    key={team._id}
                    className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'
                  >
                    <div>
                      <h4 className='font-medium text-gray-900 dark:text-white'>
                        {team.name}
                      </h4>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        ${team.total_spent.toLocaleString()} / $
                        {team.budget.toLocaleString()}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium text-gray-900 dark:text-white'>
                        {(team.budget_utilization || 0).toFixed(1)}%
                      </p>
                      <Progress
                        value={team.budget_utilization || 0}
                        color={
                          team.is_over_budget
                            ? 'danger'
                            : team.is_near_budget
                            ? 'warning'
                            : 'success'
                        }
                        className='w-16'
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader className='flex justify-between items-center'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Recent Expenses
            </h3>
            <Button as={Link} to='/expenses' size='sm' variant='light'>
              View All
            </Button>
          </CardHeader>
          <CardBody>
            {expensesData.length === 0 ? (
              <EmptyState
                message='No expenses yet'
                action={
                  <Button
                    as={Link}
                    to='/expenses'
                    color='primary'
                    startContent={<Plus size={16} />}
                  >
                    Add Expense
                  </Button>
                }
              />
            ) : (
              <div className='space-y-3'>
                {recentExpenses.map(expense => (
                  <div
                    key={expense._id}
                    className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'
                  >
                    <div className='flex items-center space-x-3'>
                      <Receipt className='h-5 w-5 text-gray-400' />
                      <div>
                        <p className='font-medium text-gray-900 dark:text-white'>
                          {expense.description}
                        </p>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          {typeof expense.team_id === 'object'
                            ? expense.team_id.name
                            : 'Unknown Team'}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium text-gray-900 dark:text-white'>
                        ${expense.amount.toLocaleString()}
                      </p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        {expense.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
