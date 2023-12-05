// import { useState } from 'react';
// import axios from "axios";
// import { useNavigate } from 'react-router-dom';

// function Login(props) {
//   const navigate = useNavigate();
//   axios.defaults.withCredentials = true;
//     const [loginForm, setloginForm] = useState({
//       email: "",
//       password: ""
//     })

//     function logMeIn(event) {
//       axios({
//         method: "POST",
//         url:"/login",
//         data:{
//           email: loginForm.email,
//           password: loginForm.password
//          }
//       })
//       .then((response) => {
//         props.setToken(response.data.access_token)
//         if (response.result === 'success') {

//         navigate("/document");
//         }
//       }).catch((error) => {
//         if (error.response) {
//           console.log(error.response)
//           console.log(error.response.status)
//           console.log(error.response.headers)
//           }
//       })

//       setloginForm(({
//         email: "",
//         password: ""}))

//       event.preventDefault()
//     }

//     function handleChange(event) { 
//       const {value, name} = event.target
//       setloginForm(prevNote => ({
//           ...prevNote, [name]: value})
//       )}

//     return (
//       <div>
//         <h1>Login</h1>
//           <form className="login">
//             <input onChange={handleChange} 
//                   type="email"
//                   text={loginForm.email} 
//                   name="email" 
//                   placeholder="Email" 
//                   value={loginForm.email} />
//             <input onChange={handleChange} 
//                   type="password"
//                   text={loginForm.password} 
//                   name="password" 
//                   placeholder="Password" 
//                   value={loginForm.password} />

//           <button onClick={logMeIn}>Submit</button>
//         </form>
//       </div>
//     );
// }

// export default Login;

// Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import '../App.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons'

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    // This snippet of code prevent the form from being unable to log in (and that weird question mark on the URL)
    var form = document.querySelector("form");;
    form.addEventListener("submit", function (event) {
      event.preventDefault()
    });
    ////// STACK OVERFLOW BABY (https://stackoverflow.com/questions/50130902/question-mark-in-url-when-make-login)

    try {
      const response = await axios.post('http://localhost:3000/login', {
        email,
        password,
      });

      const { access_token } = response.data;

      // Save the access token to local storage or a state management tool
      localStorage.setItem('access_token', access_token);

      // Trigger the onLogin callback to navigate to the home page
      onLogin();
      // Use the navigate function to go to the /document path
      navigate('/document');
    } catch (error) {
      setLoginFailed(true)

      console.error('Login failed:', error);
      // Handle login failure (e.g., show an error message)
    }
  };

  return (
    <div>
      {/* <h2>Login</h2>
      {loginFailed && (
          <Stack sx={{ width: '100%' }} spacing={2} >
            <Alert severity="error">Wrong username or password !</Alert>
          </Stack>
        )}
      <label>
        Email:
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <br />
      <label>
        Password:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <br />
      <button onClick={handleLogin}>Login</button>

      <button  onClick={() => navigate("/register")}>Register</button> */}

      {/* //////////////////// */}
      <div className="container">
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
                <Stack sx={{ width: '100%' }} spacing={2} >
                  <Alert severity="error">Wrong username or password !</Alert>
                </Stack>
              )}
              <button className="btn solid" id="sign-up-btn" onClick={handleLogin}>Login</button>

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
                {/* <a href="#" className="social-icon">
                  <i className="fab fa-google"></i>
                </a>
                <a href="#" className="social-icon">
                  <i className="fab fa-linkedin-in"></i>
                </a> */}
              </div>
            </form>


          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New here ?</h3>
              <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas rerum nulla eius?</p>
              <button className="btn transparent" id="sign-up-btn" onClick={() => navigate("/register")}>Sign up</button>
            </div>

            {/* <img src="img/log.svg" className="image" alt="" /> */}
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>One of us ?</h3>
              <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas rerum nulla eius?</p>
              <button className="btn transparent" id="sign-in-btn">Sign in</button>
            </div>

            {/* <img src="img/register.svg" className="image" alt="" /> */}
          </div>
        </div>
      </div>

    </div>

  );
};

export default Login;