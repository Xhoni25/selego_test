import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from '@nextui-org/react';
import { useAuth } from '../contexts/AuthContext';
import { Home, Users, Receipt, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Teams', href: '/teams', icon: Users },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
  ];

  const isActive = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = (): void => {
    logout();
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      {/* Mobile menu button */}
      <div className='lg:hidden fixed top-4 left-4 z-50'>
        <Button
          isIconOnly
          variant='light'
          onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className='bg-white dark:bg-gray-800 shadow-md'
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className='lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50'
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex flex-col h-full'>
          {/* Logo */}
          <div className='flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700'>
            <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
              Expense Manager
            </h1>
          </div>

          {/* Navigation */}
          <nav className='flex-1 px-4 py-6 space-y-2'>
            {navigation.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={20} className='mr-3' />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className='p-4 border-t border-gray-200 dark:border-gray-700'>
            <Dropdown placement='top-start'>
              <DropdownTrigger>
                <Button
                  variant='light'
                  className='w-full justify-start p-2 h-auto'
                >
                  <div className='flex items-center space-x-3'>
                    <Avatar
                      size='sm'
                      name={user?.name}
                      className='bg-blue-500 text-white'
                    />
                    <div className='text-left'>
                      <p className='text-sm font-medium text-gray-900 dark:text-white'>
                        {user?.name}
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label='User menu'>
                <DropdownItem
                  key='logout'
                  color='danger'
                  startContent={<LogOut size={16} />}
                  onPress={handleLogout}
                >
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='lg:ml-64'>
        <main className='py-6'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
