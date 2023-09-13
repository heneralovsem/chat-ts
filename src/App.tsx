import React, { createContext, useState } from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import AppRouter from './components/AppRouter';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useContext } from 'react';
import { Context } from '.';
import MainLoader from './components/MainLoader/MainLoader';
import { RoomContext } from '.';

function App() {
  const {auth} = useContext(Context)
  const [user, loading, error] = useAuthState(auth)
  const lastRoom = localStorage.getItem('roomId')
  const [selectedRoom, setSelectedRoom] =  useState<string>(lastRoom || 'General')
  if (loading) {
    return <MainLoader/>
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
