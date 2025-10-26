import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button, Input, Card, CardBody, CardHeader } from '@nextui-org/react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { RegisterRequest } from '../types';

const Register: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterRequest & { confirmPassword: string }>();

  const password = watch('password');

  const onSubmit = async (data: RegisterRequest): Promise<void> => {
    setIsLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = (): void => {
    setIsVisible(!isVisible);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900 dark:text-white'>
            Create your account
          </h2>
          <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
            Or{' '}
            <Link
              to='/login'
              className='font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400'
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Card className='mt-8'>
          <CardHeader className='pb-0'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
              Register
            </h3>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              <Input
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
                type='text'
                label='Full Name'
                placeholder='Enter your full name'
                startContent={<User size={20} />}
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
                className='w-full'
              />

              <Input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type='email'
                label='Email'
                placeholder='Enter your email'
                startContent={<Mail size={20} />}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                className='w-full'
              />

              <Input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                type={isVisible ? 'text' : 'password'}
                label='Password'
                placeholder='Enter your password'
                startContent={<Lock size={20} />}
                endContent={
                  <button
                    className='focus:outline-none'
                    type='button'
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeOff size={20} className='text-gray-400' />
                    ) : (
                      <Eye size={20} className='text-gray-400' />
                    )}
                  </button>
                }
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                className='w-full'
              />

              <Input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value =>
                    value === password || 'Passwords do not match',
                })}
                type={isVisible ? 'text' : 'password'}
                label='Confirm Password'
                placeholder='Confirm your password'
                startContent={<Lock size={20} />}
                endContent={
                  <button
                    className='focus:outline-none'
                    type='button'
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeOff size={20} className='text-gray-400' />
                    ) : (
                      <Eye size={20} className='text-gray-400' />
                    )}
                  </button>
                }
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword?.message}
                className='w-full'
              />

              <Button
                type='submit'
                color='primary'
                className='w-full'
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Register;
