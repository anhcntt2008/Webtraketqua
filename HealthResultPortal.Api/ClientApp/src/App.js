import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import VisitListPage from './pages/VisitListPage';
import ResultPage from './pages/ResultPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AdminUsersPage from './pages/AdminUsersPage';
import { AuthService } from './services/api';

export default function App() {
  const [user, setUser] = useState(() => AuthService.getUser());
  const [view, setView] = useState('visits'); // 'visits' | 'result' | 'changePw' | 'admin'
  const [selectedVisit, setSelectedVisit] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setSelectedVisit(null);
    setView('visits');
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setSelectedVisit(null);
    setView('visits');
  };

  const handleSelectVisit = (maLuotKham) => {
    setSelectedVisit(maLuotKham);
    setView('result');
  };

  const backToVisits = () => {
    setSelectedVisit(null);
    setView('visits');
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  if (view === 'changePw')
    return <ChangePasswordPage user={user} onBack={backToVisits} />;

  if (view === 'admin' && user.isAdmin)
    return <AdminUsersPage onBack={backToVisits} />;

  if (view === 'result' && selectedVisit)
    return <ResultPage user={user} maLuotKham={selectedVisit} onLogout={handleLogout} onBack={backToVisits} />;

  return (
    <VisitListPage
      user={user}
      onLogout={handleLogout}
      onSelectVisit={handleSelectVisit}
      onChangePassword={() => setView('changePw')}
      onOpenAdmin={() => setView('admin')}
    />
  );
}
