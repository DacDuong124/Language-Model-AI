import React, { useState } from 'react';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import './App.css'

//AUTH COMPONENTS
import LoginSignUp from './components/LoginSignUp'

import SignUp from './components/SignUp'
import Profile from './components/Profile'
import Header from './components/Header'
import useToken from './components/useToken'
//USER
import DashboardUser from './User/DashboardUser'
import Document from './User/Document'


function App() {
  // const { token, removeToken, setToken } = useToken();

  const [isLoggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  return (
    <BrowserRouter>
      <Routes>
      <Route path='/' element={<Navigate to = "/login" />}></Route>

        {/* <Route path='/login' element={<Login />}></Route> */}
        <Route
          path="/login"
          element={<LoginSignUp onLogin={handleLogin} />}
        />
        {/* <Route path='/register' element={<SignUp />}></Route> */}

        {/* <Route path='/document' element={<Document />}></Route> */}

        <Route
          path="/document"
          element={isLoggedIn ? <Document /> : <LoginSignUp onLogin={handleLogin} />}
        />

      </Routes>

      {/* <div className="App">
        <Header token={removeToken}/>
        {!token && token!=="" &&token!== undefined?  
        <Login setToken={setToken} />
        :(
          <>
            <Routes>
              <Route exact path="/profile" element={<Profile token={token} setToken={setToken}/>}></Route>
            </Routes>
          </>
        )}
        <SignUp/>
      </div> */}
    </BrowserRouter>
  );
}

export default App;