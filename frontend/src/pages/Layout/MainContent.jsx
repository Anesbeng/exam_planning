import React from 'react';

const MainContent = ({ children, isSidebarOpen }) => {
  return (
    <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {children}
    </main>
  );
};

export default MainContent;