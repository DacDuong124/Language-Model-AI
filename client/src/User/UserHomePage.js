// Sidebar.js
import React from 'react';
import Sidebar from './Sidebar'; // Import your styles

const UserHomePage = () => {
  return (
    <div className="home">
      <Sidebar />
      <div className="content">
        <h2>Home</h2>
      </div>
    </div>

  );
};

export default UserHomePage;