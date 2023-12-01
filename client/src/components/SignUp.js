import { useState } from 'react';
import axios from "axios";

function SignUp(props) {

    const [signUpForm, setSignUpForm] = useState({
      email: "",
      password: ""
    })

    function signMeUp(event) {
      axios({
        method: "POST",
        url:"/register",
        data:{
          email: signUpForm.email,
          password: signUpForm.password
         }
      })
      .then((response) => {
        props.setToken(response.data.access_token)
      }).catch((error) => {
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
          }
      })

      setSignUpForm(({
        email: "",
        password: ""}))

      event.preventDefault()
    }

    function handleChange(event) { 
      const {value, name} = event.target
      setSignUpForm(prevNote => ({
          ...prevNote, [name]: value})
      )}

    return (
      <div>
        <h1>SignUp</h1>
          <form className="signUp">
            <input onChange={handleChange} 
                  type="email"
                  text={signUpForm.email} 
                  name="email" 
                  placeholder="Email" 
                  value={signUpForm.email} />
            <input onChange={handleChange} 
                  type="password"
                  text={signUpForm.password} 
                  name="password" 
                  placeholder="Password" 
                  value={signUpForm.password} />

          <button onClick={signMeUp}>Submit</button>
        </form>
      </div>
    );
}

export default SignUp;




// import React, { useState } from 'react';
// import axios from "axios";

// const SignUp = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [error, setError] = useState('');

//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleRegister = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) {
//         const result = await response.json();
//         setError(result.error || 'Failed to register user');
//       } else {
//         setError('');
//         console.log('User registered successfully!');
//       }
//     } catch (error) {
//       console.error('Error registering user:', error.message);
//       setError('An error occurred while registering user');
//     }
//   };

//   return (
//     <div>
//       <h2>User Registration</h2>
//       <label>
//         Email:
//         <input
//           type="email"
//           name="email"
//           value={formData.email}
//           onChange={handleInputChange}
//         />
//       </label>
//       <br />
//       <label>
//         Password:
//         <input
//           type="password"
//           name="password"
//           value={formData.password}
//           onChange={handleInputChange}
//         />
//       </label>
//       <br />
//       <button onClick={handleRegister}>Register</button>
//       {error && <div>Error: {error}</div>}
//     </div>
//   );
// };

// export default SignUp;
