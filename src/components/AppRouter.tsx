import React, {useContext} from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { publicRoutes, privateRoutes } from "../router/routes";
import { useAuthState} from 'react-firebase-hooks/auth'
import { Context } from "..";



const AppRouter = () => {
    const {auth} = useContext(Context)
    const [user] = useAuthState(auth)
    console.log(user)
    return (
        <div>
           
    {user ?  <Routes>
    {privateRoutes.map(route => <Route path={route.path} element={route.component} key={route.path}/>)}
    </Routes> : <Routes>
    {publicRoutes.map(route => <Route path={route.path} element={route.component} key={route.path}/>)}
    </Routes>}
        </div>
    )
}
export default AppRouter;