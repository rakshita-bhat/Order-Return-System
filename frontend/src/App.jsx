import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import ReturnForm from './components/ReturnForm';
import ReturnList from './components/ReturnList';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isEmployee = user.role === 'EMPLOYEE';

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <h1>Order Returns System</h1>
          <div className="header-user">
            <span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span>
            <span className="user-name">{user.name}</span>
            <button className="btn-logout" onClick={handleLogout}>Sign out</button>
          </div>
        </div>
        <p>{isEmployee ? 'Review and manage return requests' : 'Submit and track your return requests'}</p>
      </header>
      <main className="main">
        {!isEmployee && (
          <section className="section-form">
            <ReturnForm onSuccess={handleSuccess} />
          </section>
        )}
        <section className="section-list">
          <ReturnList key={refreshKey} mode={isEmployee ? 'employee' : 'customer'} />
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
