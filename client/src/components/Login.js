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

const Login = ({onLogin}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
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
      console.error('Login failed:', error);
      // Handle login failure (e.g., show an error message)
    }
  };

  return (
    <div>
      <h2>Login</h2>
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
    </div>
  );
};

export default Login;