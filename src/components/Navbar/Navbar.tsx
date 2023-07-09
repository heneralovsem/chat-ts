import React, {FC, useState, useContext} from 'react'
import { Link } from "react-router-dom";
import Button from '@mui/material/Button'
import cl from './Navbar.module.css'
import { useAuthState } from 'react-firebase-hooks/auth';
import { Context } from '../..';
import { signOut } from 'firebase/auth';


const Navbar: FC = () => {
    const {auth} = useContext(Context)
    const [user] = useAuthState(auth)
    
    const [openBurger, setOpenBurger] = useState(false)
    
     const logout = () => {
       
    //     localStorage.removeItem('token')
    //     user.setUser({})
    //     user.setIsAuth(false)
         window.location.reload()
       }
    const openNav = () => {
        setOpenBurger(!openBurger)
    }
    return (
        <div className={cl.menu__bg}>
        <div className={cl.menu}>
        <div className={cl.menu__links}>
        <Link className={cl.menu__link} to="/home">Home</Link>
        <Link className={cl.menu__link} to="/chat">Chat</Link>
        </div>
        <div onClick={openNav} className={cl.burger__wrapper}>
        <span className={cl.bar}></span>
        <span className={cl.bar}></span>
        <span className={cl.bar}></span>
        {openBurger ? <div className={cl.burger__links}>
        <Link className={cl.menu__link} to="/home">Home</Link>
        <Link className={cl.menu__link} to="/chat">Chat</Link>
            </div> : null }
        </div>
        
        <div className={cl.auth__links}>
        
        {!user ? <Button variant="outlined"><Link className={cl.button__link} to="/login">Log in</Link></Button> : <Button variant="outlined" onClick={() => auth.signOut()}>Log out</Button> }
      
        </div>
        
     
    </div>
        </div>
    )
}

export default Navbar;