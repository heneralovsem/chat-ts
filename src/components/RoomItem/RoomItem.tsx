import React, {FC, useContext, useState} from 'react'
import { IRoom } from '../../types/types';
import { Avatar, Button } from '@mui/material';
import { Context, RoomContext } from '../..';
import { collection, query, orderBy } from 'firebase/firestore';
import { IMessage } from '../../types/types';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import cl from './RoomItem.module.css'
import dayjs from 'dayjs'

interface RoomItemProps {
    room: IRoom;
    isScrolling: boolean;
    setIsScrolling: any;
}


const RoomItem: FC<RoomItemProps> = ({room, isScrolling, setIsScrolling}) => {
const { auth, firestore } = useContext(Context);
const [messages, loading] = useCollectionData<IMessage>(
    query(
        collection(firestore, `rooms/${room.name}/messages`),
        orderBy("createdAt")
    )
    );
const lastMessage = messages?.[messages?.length - 1]
const {selectedRoom, setSelectedRoom} = useContext(RoomContext)
const selectRoom = () => {
    setSelectedRoom(room.name)
    setIsScrolling(false)
}
const lastMessageDate = lastMessage?.createdAt && lastMessage.createdAt.toDate()
    const currentDate = new Date ()
    const dayDifference = lastMessageDate && Math.floor((currentDate.getTime() - lastMessageDate.getTime()) / (1000*3600*24))
    const hoursAndMins = dayjs(lastMessageDate).format('HH:mm')
    const fullDate = dayjs(lastMessageDate).format('DD.MM.YY HH:mm')    

    
    return (
        <div className={cl.room__wrapper} onClick={selectRoom}>
            <h1 className={cl.room__name}>{room.name}</h1>
            {lastMessage && <div className={cl.room__message}> <div className={cl.room__avatar__row}> <Avatar src={lastMessage?.photoURL}/>
            <span>{lastMessage?.displayName}</span> <span> {dayDifference > 0 ? fullDate : hoursAndMins}</span> </div> <div className={cl.room__message__text}>
           {lastMessage.text && lastMessage?.text?.length > 25 ? <p>{lastMessage.text.substring(0, 25)}...</p> : <p>{lastMessage?.text}</p>} 
           </div>
            </div> }
           
        </div>
    )
}

export default RoomItem;