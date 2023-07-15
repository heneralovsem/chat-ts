import React, { createContext, useState } from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import AppRouter from './components/AppRouter';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useContext } from 'react';
import { Context } from '.';
import Loader from './components/Loader/Loader';
import { RoomContext } from '.';

function App() {
  const {auth} = useContext(Context)
  const [user, loading, error] = useAuthState(auth)
  
  const [selectedRoom, setSelectedRoom] =  useState<string>('General')
  if (loading) {
    return <Loader/>
  }


  return (
    <RoomContext.Provider value={{
      selectedRoom, setSelectedRoom
    }}> 
      <BrowserRouter>
        <Navbar/>
        <AppRouter/>
    </BrowserRouter>
    </RoomContext.Provider>
    
  );
}

export default App;
