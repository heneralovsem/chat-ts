import React, {FC, useContext, useState} from 'react'
import { IRoom } from '../../types/types';
import { Button } from '@mui/material';
import { Context, RoomContext } from '../..';

interface RoomItemProps {
    room: IRoom
}

const RoomItem: FC<RoomItemProps> = ({room}) => {
const {selectedRoom, setSelectedRoom} = useContext(RoomContext)
const selectRoom = () => {
    setSelectedRoom(room.name)
}    

    
    return (
        <div>
            <Button onClick={selectRoom}>{room.name}</Button>
        </div>
    )
}

export default RoomItem;