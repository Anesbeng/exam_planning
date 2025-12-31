import React from 'react';
import api from '../../api/axios'; 
import { useNavigate } from 'react-router-dom';

const Header = ({ user, onToggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call Laravel logout endpoint to revoke the current token
      await api.post('/logout');
      console.log("✅ Logged out successfully from server");
    } catch (err) {
      // Even if the API call fails, proceed with local cleanup
      console.warn("⚠️ Logout API failed:", err);
    } finally {
      console.log("🧹 Clearing all auth data...");
      
      // Clear ALL storage (not just user)
      localStorage.clear();
      sessionStorage.clear();

      // Clear Authorization header from axios
      delete api.defaults.headers.common["Authorization"];

      console.log("🔄 Redirecting to login with hard refresh...");
      
      // Use window.location.href for a complete clean reload
      window.location.href = "/login";
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onToggleSidebar}>
          ☰
        </button>
        <h1>UABT - Admin</h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <span>Welcome, {user?.name || 'Administrator'}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>
    </header>
  );
};

export default Header;