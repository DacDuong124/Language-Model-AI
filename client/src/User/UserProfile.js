// UserProfile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from "firebase/auth";
import { auth } from '../firebase-config'; // Adjust the path to your Firebase config file
import moment from 'moment';

import './sidebar.css'; // Import your styles
import '../App.css'
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { purple, cyan, amber, red } from '@mui/material/colors';

const UserProfile = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [registeredDate, setRegisteredDate] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Function to fetch user data
  useEffect(() => {
    const jwtToken = localStorage.getItem('jwtToken'); // Replace with your token retrieval method
    if (!jwtToken) {
      navigate('/login'); // Redirect to login if no token is found
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
        setFirstName(data.firstName || ''); // Set to empty string if undefined
        setLastName(data.lastName || ''); // Set to empty string if undefined
        setEmail(data.email); // Set to empty string if undefined
        setRole(data.role); // Assuming email will always be present
        setStatus(data.status); // Assuming email will always be present
        setRegisteredDate(data.registered_on); // Assuming email will always be present

      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        navigate('/login'); // Redirect to login on error
      });
  }, [navigate]); // Dependency array includes navigate

  // Function to update user data
  const handleUpdate = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    const jwtToken = localStorage.getItem('jwtToken'); // Retrieve the JWT token again
    if (!jwtToken) {
      navigate('/login'); // Redirect to login if no token is found
      return;
    }

    fetch('http://localhost:3000/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ firstName, lastName }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update profile');
        }
        return response.json();
      })
      .then(data => {
        console.log('Profile updated:', data);
        // Additional logic after successful update (e.g., show success message)
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        // Handle the error (e.g., show error message)
      });
  };

  //The logout function
  const handleLogout = () => {
    // Clear the JWT token from local storage
    localStorage.removeItem('jwtToken');

    // Reset any application state related to the user (if applicable)

    // Redirect to the login page or home page
    navigate('/login'); // or navigate to any other page you see fit
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {  // Example length check
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (!auth.currentUser) {
      console.error('No user is currently logged in.');
      setPasswordError('No user is currently logged in.');
      return;
    }

    // Use the imported `auth` object directly
    updatePassword(auth.currentUser, newPassword).then(() => {
      // Password update successful
      console.log("Password updated successfully.");
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      handleLogout();
      // You might want to show a success message
    }).catch((error) => {
      // An error happened
      console.error('Error updating password:', error);
      setPasswordError('Failed to update password.');
    });
  };

  const ColorButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(purple[500]),
    backgroundColor: cyan[500],
    '&:hover': {
      backgroundColor: amber[700],
    },
  }));

  const ColorButtonDelete = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(purple[500]),
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: purple[700],
    },
  }));

  const formatDate = (dateString) => {
    return moment(dateString).format('MMMM Do YYYY, h:mm a');
  };

  //ACCOUNT DELETE FUNCTION
  const handleDeleteAccount = () => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
      console.error('No JWT token found');
      return;
    }

    if (window.confirm('Are you sure you want to delete your account? This action WILL NOT be undone.')) {
      fetch('http://localhost:3000/delete_account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete account');
          }
          return response.json();
        })
        .then(() => {
          console.log('Account deleted successfully');
          // Perform any additional cleanup, like redirecting to a login page
          navigate('/login');
        })
        .catch(error => {
          console.error('Error deleting account:', error);
        });
    }
  };

  return (

    <div >
      <div className='userProfileTitle'>
        <h1>User Profile</h1>
      </div>

      <div className='userProfileContainer'>

        <h3 style={{ paddingLeft: '90px', paddingTop: '20px' }}>Profile</h3>
        <Box
          component="form"
          sx={{
            display: 'flex',        // This enables flexbox layout
            flexDirection: 'row',   // This sets the direction of flex items to horizontal

            '& > :not(style)': { m: 1, width: '25ch' },
          }}
          noValidate
          autoComplete="off"
        >
          <TextField id="firstName" label="First Name" variant="standard"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name" />

          <TextField id="lastName" label="Last Name" variant="standard"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name" />


        </Box>
        <Box
          component="form"
          sx={{
            display: 'flex',        // This enables flexbox layout

            '& > :not(style)': { m: 1, width: '52ch' },
          }}
          noValidate
          autoComplete="off"
        >
          <TextField
            id="email"
            label="Email"
            variant="standard"
            value={email} // Set the value to userData.email
            // If you want the field to be read-only, uncomment the next line
            InputProps={{ readOnly: true }}
          />



          <ColorButton onClick={handleUpdate} variant="contained">Update Info</ColorButton>


          <TextField
            type="password"
            label="New Password"
            variant="standard"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
          />
          <TextField
            type="password"
            label="Confirm New Password"
            variant="standard"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
          />
          {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
          <ColorButton onClick={handlePasswordUpdate} variant="contained">Change Password</ColorButton>

        </Box>

        <Box
          component="form"
          sx={{
            display: 'flex',        // This enables flexbox layout

            '& > :not(style)': { m: 1, width: '30ch' },
          }}
          noValidate
          autoComplete="off"
        >
          <TextField
            type="role"
            label="User Role"
            variant="standard"
            value={role}
          />
          <TextField
            type="registerDate"
            label="Registration Date"
            variant="standard"
            value={formatDate(registeredDate)}
          />
          <TextField
            type="status"
            label="User Status"
            variant="standard"
            value={status}
          />

        </Box>

        <Box
          component="form"
          sx={{
            display: 'flex',        // This enables flexbox layout

            '& > :not(style)': { m: 4, width: '30ch' },
          }}>

          <ColorButtonDelete onClick={handleDeleteAccount} variant="contained">Delete Account</ColorButtonDelete>


        </Box>

      </div>
    </div>
  );
};

export default UserProfile;

// Need role, registered date, job info (why r u need this app for ? engineering, ect), and state: Active or disable, or banned ?