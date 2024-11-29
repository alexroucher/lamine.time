import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthGuard from './components/AuthGuard';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeForm from './pages/EmployeeForm';
import Clients from './pages/Clients';
import ClientForm from './pages/ClientForm';
import TimeEntries from './pages/TimeEntries';
import TimeEntryForm from './pages/TimeEntryForm';
import Login from './pages/Login';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="page-background" />
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/employees/new" element={<EmployeeForm />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/clients/new" element={<ClientForm />} />
                    <Route path="/time-entries" element={<TimeEntries />} />
                    <Route path="/time-entries/new" element={<TimeEntryForm />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Toaster position="top-right" />
              </div>
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;