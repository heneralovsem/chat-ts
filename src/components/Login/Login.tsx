import React, {FC, useContext} from 'react'
import cl from './Login.module.css'
import { Button } from '@mui/material'
import { Context } from '../..'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const Login: FC = () => {
    const {auth} = useContext(Context)

    const login = async () => {
      const provider = new GoogleAuthProvider()
      const {user} = await signInWithPopup(auth, provider)
      
      console.log(user)
    }

    return (
        <div className={cl.login__wrapper}>
          <div className={cl.login__form}>
              <Button onClick={login} variant='outlined'>Sign in with Google</Button>
          </div> 
        </div>
    )
}

export default Login;