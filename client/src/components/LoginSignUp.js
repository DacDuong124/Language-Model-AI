// Login.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import Stack from '@mui/material/Stack';
import '../App.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebook, faMicrosoft } from '@fortawesome/free-brands-svg-icons';
import { faUser, faLock, faMailBulk } from '@fortawesome/free-solid-svg-icons'
import Robot from '../media/robot.png'
import Robot2 from '../media/robot2.png'


const LoginSignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loginFailed, setLoginFailed] = useState(false);
  const [registerFailed, setRegisterFailed] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const navigate = useNavigate();

  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const handleSignUpClick = () => {
    setIsSignUpMode(true);
  };

  const handleSignInClick = () => {
    setIsSignUpMode(false);
  };

  const signMeUp = async () => {
    // // This snippet of code prevent the form from being unable to log in (and that weird question mark on the URL)
    // var form = document.querySelector("form");;
    // form.addEventListener("submit", function (event) {
    //   event.preventDefault()
    // });
    ////// STACK OVERFLOW BABY (https://stackoverflow.com/questions/50130902/question-mark-in-url-when-make-login)
    try {
      const response = await axios.post('http://localhost:3000/register', {
        email,
        password,
      });



      // Use the navigate function to go to the /login path
      // navigate('/login');
      setRegisterSuccess(true)

    } catch (error) {
      setRegisterFailed(true)

      console.error('Register failed:', error);
      // Handle login failure (e.g., show an error message)
    }

  }

  // const handleLogin = async () => {
  //   try {
  //     const response = await axios.post('http://localhost:3000/login', {
  //       email,
  //       password,
  //     });
  
  //     const { access_token } = response.data;
  
  //     // Save the access token to local storage
  //     localStorage.setItem('jwtToken', access_token); // Ensure consistent token key
  
  //     // Trigger the onLogin callback to navigate to the home page
  //     // onLogin();
  
  //     // Use the navigate function to go to the /userHomePage path
  //     navigate('/userHomePage');
  
  //   } catch (error) {
  //     setLoginFailed(true);
  
  //     // More detailed error handling
  //     if (error.response) {
  //       // The request was made and the server responded with a status code
  //       // that falls out of the range of 2xx
  //       console.error('Login failed:', error.response.data);
  //       // Display error message based on error.response.data
  //     } else if (error.request) {
  //       // The request was made but no response was received
  //       console.error('Login failed: No response from server');
  //       // Display a network error message
  //     } else {
  //       // Something happened in setting up the request that triggered an Error
  //       console.error('Login Error:', error.message);
  //       // Display a generic error message
  //     }
  //     // Handle login failure (e.g., show an error message)
  //   }
  // };

  const handleLogin = async () => {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
      // Get the user
      const user = userCredential.user;
  
      // Get the ID token
      const token = await user.getIdToken();
  
      // Save the ID token to local storage
      localStorage.setItem('jwtToken', token);
  
      // Navigate to user home page
      navigate('/userHomePage');
  
    } catch (error) {
      setLoginFailed(true);
      console.error('Login Error:', error.message);
      // Handle login failure (e.g., show an error message)
    }
  };
  // useEffect to close success alerts after 3000 milliseconds (adjust as needed)
  useEffect(() => {
    if (loginFailed) {
      setLoginFailed(true);
      const timer = setTimeout(() => {
        setLoginFailed(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [loginFailed]);

  useEffect(() => {
    if (registerFailed) {
      setRegisterFailed(true);
      const timer = setTimeout(() => {
        setRegisterFailed(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [registerFailed]);

  useEffect(() => {
    if (registerSuccess) {
      setRegisterSuccess(true);
      const timer = setTimeout(() => {
        setRegisterSuccess(false);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [registerSuccess]);


  // // https://codesandbox.io/p/sandbox/responsive-login-registration-w5lpz?file=%2Findex.html
  // UI mostly borrow from this website
  return (
    <div>


      {/* //////////////////// */}
      <div className={`container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
        <div className="forms-container">
          <div className="signin-signup">
            <form action="" className="sign-in-form">
              <h2 className="title">Sign in</h2>
              <div className="input-field">
                <i ><FontAwesomeIcon icon={faUser} /></i>
                <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="input-field">
                <i ><FontAwesomeIcon icon={faLock} /></i>
                <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {loginFailed && (
                <Stack sx={{ width: '65%' }} spacing={2} >
                  <Alert variant="filled" severity="error">
                    <AlertTitle >Error</AlertTitle>
                    Invalid username or password !</Alert>
                </Stack>
              )}

              {/* All we have to do to fix the page reset problem when press the form button, is to put a type="button" in it lol
              https://stackoverflow.com/questions/7803814/how-can-i-prevent-refresh-of-page-when-button-inside-form-is-clicked
              Once again, all hail the mighthy stackOverFlow :D
              */}
              <button className="btn solid" id="sign-in-btn" type="button" onClick={handleLogin}>Login</button>

              <p className="social-text">Or Sign in with social platforms</p>
              <div className="social-media">
                <a href="#" className="social-icon">
                  {/* GOOGLE */}
                  <i ><FontAwesomeIcon icon={faGoogle} /></i>
                </a>

                {/* FACEBOOK */}
                <a href="#" className="social-icon">
                  <i><FontAwesomeIcon icon={faFacebook} /></i>
                </a>

                {/* MICROSOFT */}
                <a href="#" className="social-icon">
                  <i><FontAwesomeIcon icon={faMicrosoft} /></i>
                </a>

                {/*<a href="#" className="social-icon">
                  <i className="fab fa-linkedin-in"></i>
                </a> */}
              </div>
            </form>


            {/* SIGN UP */}
            <form action="" className="sign-up-form">
              <h2 className="title">Sign up</h2>
              {/* This is the USERNAME section, haven't implement yet */}
              {/* <div className="input-field">
              <i ><FontAwesomeIcon icon={faUser} /></i>
                <input type="text" placeholder="Username" required />
              </div> */}
              <div className="input-field">
                <i ><FontAwesomeIcon icon={faMailBulk} /></i>
                <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />

              </div>
              <div className="input-field">
                <i ><FontAwesomeIcon icon={faLock} /></i>
                <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {registerFailed && (
                <Stack sx={{ width: '65%' }} spacing={2} >
                  <Alert variant="filled" severity="error">
                    <AlertTitle >Error</AlertTitle>
                    This account already existed !</Alert>
                </Stack>
              )}
              <br />
              {registerSuccess && (
                <Stack sx={{ width: '65%' }} spacing={2} >
                  <Alert variant="filled" severity="success">
                    <AlertTitle >Success</AlertTitle>
                    Account Create successfully ! </Alert>
                  <Alert variant="filled" severity="success">
                    <AlertTitle >Success</AlertTitle>
                    Please go to the Sign In Section</Alert>
                </Stack>
              )}
              {/* All we have to do to fix the page reset problem when press the form button, is to put a type="button" in it lol
              https://stackoverflow.com/questions/7803814/how-can-i-prevent-refresh-of-page-when-button-inside-form-is-clicked
              Once again, all hail the mighthy stackOverFlow :D
              */}
              <button className="btn solid" id="sign-up-btn" type="button" onClick={signMeUp}>Create Account</button>

              <p className="social-text">Or Sign up with social platforms</p>
              <div className="social-media">
                <a href="#" className="social-icon">
                  {/* GOOGLE */}
                  <i ><FontAwesomeIcon icon={faGoogle} /></i>
                </a>

                {/* FACEBOOK */}
                <a href="#" className="social-icon">
                  <i><FontAwesomeIcon icon={faFacebook} /></i>
                </a>

                {/* MICROSOFT */}
                <a href="#" className="social-icon">
                  <i><FontAwesomeIcon icon={faMicrosoft} /></i>
                </a>
                {/* <a href="#" className="social-icon">
                  <i className="fab fa-google"></i>
                </a>*/}
              </div>
            </form>




          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New here ?</h3>
              <p>Click Sign Up to start your journey with our Proof Reading AI</p>
              {/* <button className="btn transparent" id="sign-up-btn" onClick={() => navigate("/register")}>Sign up</button> */}
              <button className="btn transparent" id="sign-up-btn" onClick={handleSignUpClick}>Sign up</button>

            </div>

            {/* <img src="img/log.svg" className="image" alt="" /> */}
            <img src={Robot} className="image" alt="" />

          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>One of us ?</h3>
              <p>Welcome Back ! Please Sign In to confirm your account</p>
              <button className="btn transparent" id="sign-in-btn" onClick={handleSignInClick}>Sign in</button>
            </div>

            {/* <img src="img/register.svg" className="image" alt="" /> */}
            <img src={Robot2} className="image" alt="" />

          </div>



        </div>
      </div>

    </div>

  );
};

export default LoginSignUp;