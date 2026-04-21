import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import VisitListPage from './pages/VisitListPage';
import ResultPage from './pages/ResultPage';
import { AuthService } from './services/api';

export default function App() {
  const [user, setUser] = useState(() => AuthService.getUser());
  const [selectedVisit, setSelectedVisit] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setSelectedVisit(null);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setSelectedVisit(null);
  };

  const handleSelectVisit = (maLuotKham) => {
    setSelectedVisit(maLuotKham);
  };

  const handleBackToList = () => {
    setSelectedVisit(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (!selectedVisit) {
    return <VisitListPage user={user} onLogout={handleLogout} onSelectVisit={handleSelectVisit} />;
  }

  return <ResultPage user={user} maLuotKham={selectedVisit} onLogout={handleLogout} onBack={handleBackToList} />;
}
