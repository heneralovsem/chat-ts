import React, {FC, useContext, useState} from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { Context } from '../..'
import cl from './Chat.module.css'
import {useCollectionData} from 'react-firebase-hooks/firestore'
import { TextField, Button, Avatar } from '@mui/material'
import { collection } from 'firebase/firestore'
import { orderBy } from 'firebase/firestore'
import { serverTimestamp } from 'firebase/firestore'
import { addDoc } from 'firebase/firestore'
import { query } from 'firebase/firestore'
import { IMessage } from '../../types/types'
import { FirestoreDataConverter } from 'firebase/firestore'




const Chat: FC = () => {
    const {auth, firestore} = useContext(Context)
    const [user] = useAuthState(auth)
    const [value, setValue] = useState<string>('')
    const sendMessage = async () => {
       await addDoc(collection(firestore, 'messages') ,{
            uid: user?.uid,
            displayName: user?.displayName,
            photoURL: user?.photoURL,
            text: value,
            createdAt: serverTimestamp()
        });
        setValue('')
    }
    const messageConverter = () => {
        
    }
    const [messages, loading] = useCollectionData(
        query(collection(firestore, 'messages'),
        orderBy('createdAt')),
        
        
    )
    
    return (
        <div className={cl.chat__wrapper}>
            <div className={cl.chat__content}>
                <div className={cl.chat__messages}>
                    {messages?.map(message => 
                            <div key={message.createdAt} className={user?.uid === message.uid ? `${cl.my__message}` : `${cl.message}`}>
                            <div className={cl.message__avatar}>
                                <Avatar src={message.photoURL}/>
                                <span>{message.displayName}</span>
                            </div>
                            <div className={cl.message__text}>{message.text}</div>
                            </div> 
                            
                        )}
                </div>
            </div>
            <div className={cl.chat__new__message}>
                <TextField value={value} onChange={(e) => setValue(e.target.value)} fullWidth maxRows={2} className={cl.chat__input} placeholder='Your message...' variant='outlined'/>
                <Button onClick={sendMessage} className={cl.chat__btn} variant='outlined'>Send</Button>
                </div>
        </div>
    )
}

export default Chat;