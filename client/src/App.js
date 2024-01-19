import React from 'react';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import './App.css'

//AUTH COMPONENTS
import LoginSignUp from './components/LoginSignUp'

// import Header from './components/Header'
// import useToken from './components/useToken'


//USER
import Document from './User/Document'
import Sidebar from './User/Sidebar';
import Trash from './User/Trash';
import UserProfile from './User/UserProfile';
import Subscription from './User/Subscription';
import ViewDocument from './User/ViewDocument';
import AIPrompt from './User/AIPrompt';

//ADMIN

import AdminSidebar from './Admin/AdminSidebar';
import ManageUserAccount from './Admin/ManageAccount';


function App() {

  // const [isLoggedIn, setLoggedIn] = useState(false);

  // const handleLogin = () => {
  //   setLoggedIn(true);
  // };

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to="/login" />}></Route>
        <Route path='/login' element={<LoginSignUp />}></Route>


        {/* USER ROLE */}
        <Route path='/' element={<Sidebar />}>
          <Route path='/viewDocument' element={<ViewDocument />}></Route>
          <Route path='/document' element={<Document />}></Route>


          <Route path='/trash' element={<Trash />}></Route>
          <Route path='/subscription' element={<Subscription />}></Route>
          <Route path='/aiPrompt' element={<AIPrompt />}></Route>

          <Route path='/userprofile' element={<UserProfile />}></Route>

        </Route>

        {/* ADMIN ROLE */}
        <Route path='/' element={<AdminSidebar />}>
        <Route path='/manageAccount' element={<ManageUserAccount />}></Route>

        </Route>


      </Routes>
    </BrowserRouter>
  );
}

export default App;