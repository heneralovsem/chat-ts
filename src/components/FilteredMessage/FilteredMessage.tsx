import React, {FC, useState, useContext} from 'react'
import { IMessage } from '../../types/types';
import dayjs from 'dayjs';
import cl from './FilteredMessage.module.css'
import { useAuthState } from 'react-firebase-hooks/auth';
import { Context, RoomContext } from '../..';
import { Avatar} from "@mui/material";

interface FilteredMessageProps {
    message: IMessage;
    selectedMessage: string | undefined;
    setSelectedMessage: (name: string) => void;
    scrollToPinned: any
  }
const FilteredMessage: FC<FilteredMessageProps> = ({message, selectedMessage, setSelectedMessage, scrollToPinned} ) => {
    const { auth } = useContext(Context);
    const [user] = useAuthState(auth);
    
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseOver = () => {
        setIsHovering(true);
      };

      const handleMouseOut = () => {
        setIsHovering(false);
      };

      const getDocId = () => {
        //@ts-ignore
        setSelectedMessage(message.docId)
        setTimeout(() => {
            scrollToPinned()
        }, )
            
        
      }
    const messageDate = message.createdAt && message.createdAt.toDate();
    const currentDate = new Date();
    const dayDifference =
      messageDate &&
      Math.floor(
        (currentDate.getTime() - messageDate.getTime()) / (1000 * 3600 * 24)
      );
    // const hoursAndMins = messageDate && messageDate.getHours() + ':' +  String(messageDate.getMinutes()).padStart(2, '0');
    const hoursAndMins = dayjs(messageDate).format("HH:mm");
    const fullDate = dayjs(messageDate).format("DD.MM.YY HH:mm");
    return (
        <div onClick={getDocId} onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        className={
          user?.uid === message.uid
            ? `${(cl.my__message, cl.message__wrapper)}`
            : `${(cl.message, cl.message__wrapper)}`
        }
      >
        <div className={cl.message__column}>
          <div className={cl.message__row}>
            <div className={cl.message__avatar__row}>
              <Avatar src={message.photoURL} />
              <span className={cl.message__displayname}>{message.displayName}</span>
              <span className={cl.message__date}> {dayDifference > 0 ? fullDate : hoursAndMins}</span>
            </div>
          </div>
          <p className={cl.message__text}>{message.text}</p>
          {message.imageURL && <div> <img className={cl.message__img} src={message.imageURL} alt="" /></div> } 
        </div>
        </div>
    )
}

export default FilteredMessage;