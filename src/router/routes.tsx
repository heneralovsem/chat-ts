import { Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ChatPage from "../pages/ChatPage";
export const privateRoutes = [
    {path: '/chat', component: <ChatPage/>},
    {path: '/', component: <Navigate to= "/chat" replace/> },
    {path: '/*', component: <Navigate to= "/chat" replace/> },
    {path: '/login', component: <Navigate to= "/chat" replace/> },
    
    
    
    
]
export const publicRoutes = [
    {path: '/login', component: <LoginPage/>},
    {path: '/', component: <Navigate to= "/chat" replace/> },
    {path: '/*', component: <Navigate to= "/chat" replace/> },
    {path: '/chat', component: <Navigate to= "/login" replace/> },
    
    

    
]