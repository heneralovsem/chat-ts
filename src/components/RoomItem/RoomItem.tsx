import React, {FC, useContext, useState} from 'react'
import { IRoom } from '../../types/types';
import { Button } from '@mui/material';
import { Context } from '../..';

interface RoomItemProps {
    room: IRoom
}

const RoomItem: FC<RoomItemProps> = ({room}) => {
    

    
    return (
        <div>
            <Button>{room.name}</Button>
        </div>
    )
}

export default RoomItem;