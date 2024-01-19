// Sidebar.js
import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faTrash,
  faUser,
  faStar,
  faSignOutAlt,
  faEnvelope,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import "./sidebar.css"; // Import your styles
import axios from "../configs/app-axios";

const Sidebar = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const jwtToken = localStorage.getItem("jwtToken"); // Get the token that was saved in the LocalStorage
    if (!jwtToken) {
      navigate("/login"); // Move back to the login page if token not found
      return;
    }

    //   fetch('http://localhost:3000/profile', {
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${jwtToken}`,
    //     },
    //   })
    //     .then(response => {
    //       if (!response.ok) {
    //         throw new Error('Token expired or invalid');
    //       }
    //       return response.json();
    //     })
    //     .then(data => {
    //       setUserData(data);
    //     })
    //     .catch(error => {
    //       console.error('Error fetching user data:', error);
    //       navigate('/login'); // Redirect to login on error
    //     });
    // }, [navigate]); // Dependency array includes navigate

    // fetch('https://languagesculptor.azurewebsites.net/profile', {
    // fetch('http://ec2-18-143-187-232.ap-southeast-1.compute.amazonaws.com:3001/profile', {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${jwtToken}`,
    //   },
    // })
    axios
      .get("/profile", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Token expired or invalid");
        }
        return response.json();
      })
      .then((data) => {
        setUserData(data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        navigate("/login"); // Redirect to login on error
      });
  }, [navigate]); // Dependency array includes navigate

  //The logout function
  const handleLogout = () => {
    // Clear the JWT token from local storage
    localStorage.removeItem("jwtToken");

    // Reset any application state related to the user (if applicable)

    // Redirect to the login page or home page
    // navigate('/login'); // or navigate to any other page you see fit
    navigate("/login");
  };

  const w3Open = () => {
    document.getElementById("main").style.marginLeft = "20%";
    document.getElementById("mySidebar").style.width = "20%";
    document.getElementById("mySidebar").style.display = "block";
    document.getElementById("openNav").style.display = "none";
  };

  const w3Close = () => {
    document.getElementById("main").style.marginLeft = "0%";
    document.getElementById("mySidebar").style.display = "none";
    document.getElementById("openNav").style.display = "inline-block";
  };
  useEffect(() => {
    // Call w3Open after the component mounts
    w3Open();
  }, []); // Empty dependency array means this effect runs once after initial render

  return (
    <div className="container-fluid">
      <div
        className="w3-sidebar w3-bar-block w3-card w3-animate-left"
        id="mySidebar"
      >
        {/* Heading */}
        <button className="w3-bar-item w3-button w3-large" onClick={w3Close}>
          Close &times;
        </button>

        <h2>Language Sculptor</h2>

        <nav>
          <ul>
            <li>
              <Link to="/document">
                <FontAwesomeIcon icon={faFile} className="fa-icon" /> My
                documents
              </Link>
            </li>
            <li>
              <Link to="/trash">
                <FontAwesomeIcon icon={faTrash} className="fa-icon" /> Recycle
                Bin
              </Link>
            </li>
            {userData?.role === "user_plus" && (
              <li>
                <Link to="/aiPrompt">
                  <FontAwesomeIcon icon={faRobot} className="fa-icon" /> AI
                  Prompt
                </Link>
              </li>
            )}
            <li>
              <Link to="/userprofile">
                <FontAwesomeIcon icon={faUser} className="fa-icon" /> My Profile
              </Link>
            </li>

            <li>
              <Link to="/subscription">
                <FontAwesomeIcon icon={faStar} className="fa-icon" /> Premium
                Subscription
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout */}
        <div className="sidebar-bottom">
          <ul>
            <li>
              <Link to="/" onClick={handleLogout} className="logout-link">
                <FontAwesomeIcon icon={faSignOutAlt} className="fa-icon" />
                Log Out
              </Link>
            </li>
            <li>
              {userData ? (
                <div className="user-info">
                  <FontAwesomeIcon icon={faEnvelope} className="fa-icon" />
                  {userData.email}
                  {/* Additional user info can be displayed here */}
                </div>
              ) : (
                <p>Loading user data...</p>
              )}
            </li>
          </ul>
        </div>
      </div>

      <div id="main">
        <button
          id="openNav"
          className="w3-button w3-teal w3-xlarge"
          onClick={w3Open}
        >
          &#9776;
        </button>
        <Outlet />
      </div>
    </div>
  );
};

export default Sidebar;
