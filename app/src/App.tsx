import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Expenses from './pages/Expenses';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size='lg' label='Loading application...' />;
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <Toaster position='top-right' />
      <Routes>
        <Route
          path='/login'
          element={user ? <Navigate to='/' replace /> : <Login />}
        />
        <Route
          path='/register'
          element={user ? <Navigate to='/' replace /> : <Register />}
        />
        <Route
          path='/*'
          element={
            user ? (
              <Layout>
                <Routes>
                  <Route path='/' element={<Dashboard />} />
                  <Route path='/teams' element={<Teams />} />
                  <Route path='/expenses' element={<Expenses />} />
                  <Route path='*' element={<Navigate to='/' replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to='/login' replace />
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
