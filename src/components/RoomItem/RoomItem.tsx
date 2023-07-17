import React, {FC, useContext, useState} from 'react'
import { IRoom } from '../../types/types';
import { Avatar, Button } from '@mui/material';
import { Context, RoomContext } from '../..';
import { collection, query, orderBy } from 'firebase/firestore';
import { IMessage } from '../../types/types';
import { useCollectionData } from 'react-firebase-hooks/firestore';

interface RoomItemProps {
    room: IRoom;
}


const RoomItem: FC<RoomItemProps> = ({room}) => {
const { auth, firestore } = useContext(Context);
const [messages, loading] = useCollectionData<IMessage>(
    query(
        collection(firestore, `rooms/${room.name}/messages`),
        orderBy("createdAt")
    )
    );
const lastMessage = messages?.[messages?.length - 1]
console.log(lastMessage)
const {selectedRoom, setSelectedRoom} = useContext(RoomContext)
const selectRoom = () => {
    setSelectedRoom(room.name)
}    

    
    return (
        <div onClick={selectRoom}>
            <h1 onClick={selectRoom}>{room.name}</h1>
            {lastMessage && <div> <Avatar src={lastMessage?.photoURL}/>
            <span>{lastMessage?.displayName}</span>
            <p>{lastMessage?.text}</p> </div> }
           
        </div>
    )
}

export default RoomItem;