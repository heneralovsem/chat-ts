import React, {FC, useContext, useState} from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { Context } from '../..'
import cl from './Chat.module.css'
import {useCollectionData} from 'react-firebase-hooks/firestore'
import { TextField, Button, Avatar } from '@mui/material'
import { collection, updateDoc } from 'firebase/firestore'
import { orderBy } from 'firebase/firestore'
import { serverTimestamp } from 'firebase/firestore'
import { addDoc, doc, FieldPath, setDoc } from 'firebase/firestore'
import { query } from 'firebase/firestore'
import { IMessage, IRoom } from '../../types/types'
import Message from '../Message/Message'
import RoomItem from '../RoomItem/RoomItem'







const Chat: FC = () => {
    const {auth, firestore} = useContext(Context)
    const [user] = useAuthState(auth)
    const [value, setValue] = useState<string>('')
    const [roomName, setRoomName] = useState<string>('')
    const [selectedRoom, setSelectedRoom] = useState<string>('room3')
    

    
    const sendMessage = async () => {
       await addDoc(collection(firestore,  `rooms/${selectedRoom}/messages`) ,{
            uid: user?.uid,
            displayName: user?.displayName,
            photoURL: user?.photoURL,
            text: value,
            createdAt: serverTimestamp(),
        });
        setValue('')
    }
    const createRoom = async (e: React.MouseEvent) => {
       await setDoc(doc(firestore, 'rooms',`${roomName}`) , {
            name: roomName,
            createdAt: serverTimestamp(),
       }) 
    } 

            
        
    
    const [rooms] = useCollectionData<IRoom>(
        query(collection(firestore, `rooms`),
        orderBy('createdAt')),
    )
    console.log(rooms)
    const [messages, loading] = useCollectionData<IMessage>(
        query(collection(firestore, `rooms/${selectedRoom}/messages`),
        orderBy('createdAt')),
        
    )
    
    
    return (
        <div className={cl.chat__wrapper}>
            <div className={cl.chat__rooms}>
                    {rooms?.map(room => <RoomItem room={room} key={room.createdAt}/>)}
                    <button onClick={createRoom}>New room...</button>
                    <TextField value={roomName} onChange={(e) => setRoomName(e.target.value)} fullWidth maxRows={2} className={cl.chat__input} placeholder='Room name...' variant='outlined'/>
            </div>
            <div className={cl.chat__content}>
                <div className={cl.chat__messages}>
                    {messages?.map(message => 
                            <Message messages={message} key={message.createdAt}/>
                            
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