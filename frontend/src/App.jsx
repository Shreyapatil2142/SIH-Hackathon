import React, { useState, useEffect } from "react";
import AdminDashboard from './components/AdminDashboard.jsx';
import Login from './components/Login.jsx';

function App() {
  const [user, setUser] = useState(null); // null = not logged in

  // Check if token already exists (e.g. user refreshed page)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ token }); // You can decode token to get user info if needed
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData); // Save user data (e.g. token, role)
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <div>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <AdminDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
