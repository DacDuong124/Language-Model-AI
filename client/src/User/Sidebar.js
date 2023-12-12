// Sidebar.js
import React, { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import './sidebar.css'; // Import your styles
// import axios from "axios";

const Sidebar = (props) => {

  // function logMeOut() {
  //   axios({
  //     method: "POST",
  //     url:"/logout",
  //   })
  //   .then((response) => {
  //      props.token()
  //   }).catch((error) => {
  //     if (error.response) {
  //       console.log(error.response)
  //       console.log(error.response.status)
  //       console.log(error.response.headers)
  //       }
  //   })}

  const w3Open = () => {
    document.getElementById("main").style.marginLeft = "25%";
    document.getElementById("mySidebar").style.width = "25%";
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

      <div className="w3-sidebar w3-bar-block w3-card w3-animate-left" id="mySidebar" >
        <h2>Language Model AI</h2>
        <button className="w3-bar-item w3-button w3-large" onClick={w3Close}>Close &times;</button>
        <nav>
          <ul>
            <li>
              <Link to="/document">My documents</Link>
            </li>
            <li>
              <Link to="/trash">Trash</Link>
            </li>
            <li>
              <Link to="/userprofile">My Profile</Link>
            </li>
            <li>
              <Link to="/subscription">Premium Subscription</Link>
            </li>

            <div style={{paddingTop:"300px"}}>
              <li>
                <h3><Link to="/">Log Out</Link></h3>
                {/* <button onClick={logMeOut}>            <h3 >Log Out</h3> </button> */}

              </li>
            </div>

          </ul>

        </nav>
      </div>


      <div id='main'>
        <button id="openNav" className="w3-button w3-teal w3-xlarge" onClick={w3Open}>&#9776;</button>
        <Outlet />
      </div>

    </div>

  );
};

export default Sidebar;