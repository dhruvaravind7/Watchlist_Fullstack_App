import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './pages/Navbar.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mnp_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleSetUser = (userData) => {
    if (userData) {
      localStorage.setItem('mnp_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('mnp_user');
    }
    setUser(userData);
  };

  return (
    <Router>
      <div className="app">
        {user && <Navbar user={user} onLogout={() => handleSetUser(null)} />}
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleSetUser} />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
