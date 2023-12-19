// UserProfile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './sidebar.css'; // Import your styles
import '../App.css'
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { purple, cyan, amber } from '@mui/material/colors';

const UserProfile = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

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
        setEmail(data.email); // Assuming email will always be present
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

  const ColorButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(purple[500]),
    backgroundColor: cyan[500],
    '&:hover': {
      backgroundColor: amber[700],
    },
  }));
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

        </Box>
      </div>
    </div>
  );
};

export default UserProfile;