import React, { useState } from 'react';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import './App.css'

//AUTH COMPONENTS
import LoginSignUp from './components/LoginSignUp'

// import Header from './components/Header'
// import useToken from './components/useToken'
//USER
import Document from './User/Document'
import UserHomePage from './User/UserHomePage';
import Sidebar from './User/Sidebar';
import Trash from './User/Trash';
import UserProfile from './User/UserProfile';
import Subscription from './User/Subscription';


function App() {
  // const { token, removeToken, setToken } = useToken();

  const [isLoggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to="/login" />}></Route>
        {/* <Route path='/login' element={<Login />}></Route> */}

        <Route
          path="/login"
          element={<LoginSignUp onLogin={handleLogin} />}
        />
        <Route
          path='/userHomePage'
          element={isLoggedIn ? <UserHomePage /> : <LoginSignUp onLogin={handleLogin} />}
        />

        {/* <Route path='/document' element={<Document />}></Route> */}

        <Route path='/' element={<Sidebar />}>
          {/* <Route path='/userHomePage' element={<UserHomePage />}></Route> */}

          <Route path='/document' element={<Document />}></Route>


          <Route path='/trash' element={<Trash />}></Route>
          <Route path='/subscription' element={<Subscription />}></Route>
          <Route path='/userprofile' element={<UserProfile />}></Route>

        </Route>




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