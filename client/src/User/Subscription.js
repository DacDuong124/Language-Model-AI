// Subscription.js
import React, { useState, useEffect } from 'react';
// import { Link, Outlet } from 'react-router-dom';
import './sidebar.css'; // Import your styles
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';


const cardStyles = {
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  padding: '20px',
  backgroundColor: '#fff',
  margin: '10px',
};

const headerStyles = {
  backgroundColor: '#f5f5f5',
  borderTopLeftRadius: '10px',
  borderTopRightRadius: '10px',
  padding: '10px 20px',
  marginBottom: '20px',
};

const buttonStyles = {
  backgroundColor: '#4caf50', // This is a Material-UI green color
  color: '#fff',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer',
};

const Subscription = () => {

  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const jwtToken = localStorage.getItem('jwtToken');
      if (!jwtToken) {
        // Handle the case where there is no token
        console.log('No JWT Token found');
        return;
      }

      try {
        //local run only
        // const response = await fetch('http://localhost:3000/profile', {

        const response = await fetch('http://ec2-18-143-187-232.ap-southeast-1.compute.amazonaws.com:3001/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserEmail(data.email);  // Set the user email
        console.log("Fetched User Email:", data.email); // Verify the fetched email

      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error, maybe navigate to login
      }
    };

    fetchUserData();
  }, []);

  const handlePaymentSuccess = async (details) => {
    console.log('Payment successful!', details);

    // Extract the payment ID from PayPal's response
    const paymentID = details.id;
    console.log("Sending Payment ID to backend:", paymentID, "User Email:", userEmail);

    try {
      // const response = await fetch('/api/verify-payment', {

      const response = await fetch('http://ec2-18-143-187-232.ap-southeast-1.compute.amazonaws.com:3001/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentID, email: userEmail }),
      });
      console.log(userEmail);
      const responseData = await response.json();
      if (response.ok) {
        console.log('User role updated to user_plus:', responseData);
        alert('Payment successful and user role updated! Please refresh the page to see changes !');
        // Update the user's role in the frontend state as needed
      } else {
        console.error('Failed to update user role:', responseData);
        alert('Payment was successful, but there was an error updating your account. Please contact support.');
      }
    } catch (error) {
      console.error('Error during payment verification:', error);
      alert('An error occurred during payment verification.');
    }
  };



  const handleTryForFree = (details) => {
    // Update user subscription status in your database
    console.log('Payment successful!', details);
    alert('Payment successful!!');
  };



  return (


    <div>
      <h1 style={{ paddingLeft: '105px', paddingTop: '20px' }}>Subscription</h1>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        {/* Free Plan */}
        <div style={cardStyles}>
          <div style={headerStyles}>
            <h2>Free</h2>
            <p>Get peace of mind with writing that’s mistake-free.</p>
          </div>
          <p>$0 USD / month</p>
          <button style={buttonStyles}>Current Plan</button>
          <ul>
            <li>Limited upload to 3 files only.</li>
            <li>See and download your corrected or formatted files.</li>
            <li>Correct word documents with our AI.</li>
          </ul>
        </div>

        {/* Premium user PLUS Plan */}
        <div style={{ ...cardStyles, border: '2px solid #4caf50' }}>
          <div style={{ ...headerStyles, backgroundColor: '#4caf50', color: '#fff' }}>
            <h2>Premium (Upgrade to User Plus)</h2>
            <p>Get unlimited upload times and an AI chatbot !</p>
          </div>
          <p>$12 USD / month, billed annually</p>
          <button
            style={{ ...buttonStyles, backgroundColor: '#fff', color: '#4caf50' }}
            onClick={handleTryForFree} // You need to define this function to handle the free trial logic
          >
            Try for Free
          </button>
          {userEmail ? (

            <PayPalScriptProvider options={{ "client-id": "AZgBNb7puFzjmvPFYD2fPlsWsFSRZNunRpHUDqGx9kR3gzxUeigK4EYwaEkgxACRmr5fjXpREe9pNg9G" }}>
              <PayPalButtons
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [{
                      amount: { value: "12.00" }, // Replace with your amount
                    }],
                  });
                }}
                onApprove={(data, actions) => {
                  return actions.order.capture().then(details => {
                    handlePaymentSuccess(details); // Not passing userEmail here as it's already in the component's state
                  });
                }}
                onError={(err) => {
                  console.error('Payment error:', err);
                  alert('An error occurred with your payment');
                }}
              />
            </PayPalScriptProvider>
          ) : (
            <p>Loading...</p> // Or any other loading indicator
          )}

          <ul>
            <li>Everything included in Free.</li>
            <li>Unlimted time to upload files.</li>
            <li>Rewrite and correct full sentences quickly with our AI Chatbot</li>
            {/* ... other features */}
          </ul>
        </div>

      </div>
    </div>

  );
};

export default Subscription;