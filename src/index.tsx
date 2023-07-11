import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { FirebaseApp } from 'firebase/app';
import 'firebase/auth'
import 'firebase/firestore'
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyALW1CXjEV-3xYNGeH0QlCmh6YQj-mo_tw",
  authDomain: "chat-ts-b953b.firebaseapp.com",
  projectId: "chat-ts-b953b",
  storageBucket: "chat-ts-b953b.appspot.com",
  messagingSenderId: "466176818582",
  appId: "1:466176818582:web:956bc5fa51ac20996b31b7",
  measurementId: "G-ZT2JH5F6Q6"
};
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

const auth = getAuth(app)
const firestore = getFirestore(app)


export const Context = createContext<any| null>(null)

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Context.Provider value ={{
    app,
    firestore,
    auth,
  }}>
    <App />
    </Context.Provider>
);


