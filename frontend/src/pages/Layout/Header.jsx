import React from 'react';
import api from '../../api/axios'; 
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Header = ({ user, onLogout, onToggleSidebar }) => {
  const navigate = useNavigate(); // For redirecting after logout

  const handleLogout = async () => {
    try {
      // Call Laravel logout endpoint to revoke the current token
      await api.post('/logout');
      console.log("Logged out successfully from server");
    } catch (err) {
      // Even if the API call fails (e.g., network issue or token already invalid),
      // we still proceed with local cleanup
      console.warn("Logout API failed:", err);
    } finally {
      // Always clear local data
      localStorage.removeItem("user");

      // Clear Authorization header from axios
      delete api.defaults.headers.common["Authorization"];

      // Optional: Notify parent component (if needed)
      if (onLogout) {
        onLogout();
      }

      // Redirect to login page
      navigate("/");
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
          <span>Welcome, Administrator</span>
          {/* Optional: Show real name if available */}
          {/* <span>Welcome, {user?.name || 'Administrator'}</span> */}
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>
    </header>
  );
};

export default Header;