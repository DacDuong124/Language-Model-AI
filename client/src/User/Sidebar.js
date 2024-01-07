// Sidebar.js
import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faTrash, faUser, faStar, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './sidebar.css'; // Import your styles
// import axios from "axios";

const Sidebar = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const jwtToken = localStorage.getItem('jwtToken'); // Get the token that was saved in the LocalStorage
    if (!jwtToken) {
      navigate('/login'); // Move back to the login page if token not found
      return;
    }

    fetch('http://localhost:3000/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Token expired or invalid');
        }
        return response.json();
      })
      .then(data => {
        setUserData(data);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        navigate('/login'); // Redirect to login on error
      });
  }, [navigate]); // Dependency array includes navigate

  //The logout function
  const handleLogout = () => {
    // Clear the JWT token from local storage
    localStorage.removeItem('jwtToken');

    // Reset any application state related to the user (if applicable)

    // Redirect to the login page or home page
    // navigate('/login'); // or navigate to any other page you see fit
    navigate('/login');
  };

  const w3Open = () => {
    document.getElementById("main").style.marginLeft = "20%";
    document.getElementById("mySidebar").style.width = "20%";
    document.getElementById("mySidebar").style.display = "block";
    document.getElementById("openNav").style.display = 'none';
  }

  const w3Close = () => {
    document.getElementById("main").style.marginLeft = "0%";
    document.getElementById("mySidebar").style.display = "none";
    document.getElementById("openNav").style.display = "inline-block";
  }
  useEffect(() => {
    // Call w3Open after the component mounts
    w3Open();
  }, []); // Empty dependency array means this effect runs once after initial render

return (
  <div className="container-fluid">
    <div className="w3-sidebar w3-bar-block w3-card w3-animate-left" id="mySidebar">
      <h2>Language Sculptor</h2>
      
      <button className="w3-bar-item w3-button w3-large" onClick={w3Close}>Close &times;</button>
      <nav>
        <ul>
          <li>
            <Link to="/document">
              <FontAwesomeIcon icon={faFile} className="fa-icon" /> My documents
            </Link>
          </li>
          <li>
            <Link to="/trash">
              <FontAwesomeIcon icon={faTrash} className="fa-icon" /> Trash
            </Link>
          </li>
          <li>
            <Link to="/userprofile">
              <FontAwesomeIcon icon={faUser} className="fa-icon" /> My Profile
            </Link>
          </li>
          <li>
            <Link to="/subscription">
              <FontAwesomeIcon icon={faStar} className="fa-icon" /> Premium Subscription
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout */}
      <div className="sidebar-bottom">
        <Link to="/" onClick={handleLogout}><h3>Log Out</h3></Link>
        {userData ? (
          <div>
            <p>Email: {userData.email}</p>
            {/* Display other user data as needed */}
          </div>
        ) : (
          <p>Loading user data...</p>
        )}
      </div>
    </div>


      <div id='main'>
        <button id="openNav" className="w3-button w3-teal w3-xlarge" onClick={w3Open}>&#9776;</button>
        <Outlet />
      </div>

    </div>

  );
};

export default Sidebar;