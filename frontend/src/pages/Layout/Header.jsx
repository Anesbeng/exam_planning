import React from 'react';

const Header = ({ user, onLogout, onToggleSidebar }) => {
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
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Déconnexion
        </button>
      </div>
    </header>
  );
};

export default Header;