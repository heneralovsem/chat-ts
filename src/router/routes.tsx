import { Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ChatPage from "../pages/ChatPage";
import HomePage from "../pages/HomePage";
export const privateRoutes = [
    {path: '/home', component: <HomePage/>},
    {path: '/chat', component: <ChatPage/>},
    {path: '/', component: <Navigate to= "/home" replace/> },
    {path: '/login', component: <Navigate to= "/home" replace/> },
    
    
    
    
]
export const publicRoutes = [
    {path: '/home', component: <HomePage/>},
    {path: '/login', component: <LoginPage/>},
    {path: '/', component: <Navigate to= "/home" replace/> },
    {path: '/chat', component: <Navigate to= "/login" replace/> },
    
    

    
]