import React, {FC, useContext} from 'react'
import { IMessage } from '../../types/types';
import cl from './Message.module.css'
import { Avatar } from '@mui/material';
import { Context } from '../..';
import { useAuthState } from 'react-firebase-hooks/auth';


interface MessageProps {
    messages: IMessage;
}

const Message: FC<MessageProps> = ({messages}) => {
    const {auth} = useContext(Context)
    const [user] = useAuthState(auth)
    return (
        <div>
            <div key={messages.createdAt} className={user?.uid === messages.uid ? `${cl.my__message}` : `${cl.message}`}>
                            <div className={cl.message__avatar}>
                                <Avatar src={messages.photoURL}/>
                                <span>{messages.displayName}</span>
                            </div>
                            <div className={cl.message__text}>{messages.text}</div>
                            </div> 
        </div>
    )
}

export default Message;