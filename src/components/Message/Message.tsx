import React, { FC, forwardRef, useContext, useState } from "react";
import { IMessage } from "../../types/types";
import cl from "./Message.module.css";
import { Avatar, IconButton } from "@mui/material";
import { Context } from "../..";
import { RoomContext } from "../..";
import { useAuthState } from "react-firebase-hooks/auth";
import dayjs from "dayjs";
import { Modal, TextField, Button } from "@mui/material";
import { updateDoc, collection, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import ReplyIcon from '@mui/icons-material/Reply'
import EditMessageModal from "../EditMessageModal/EditMessageModal";
import { DocumentReference } from "firebase/firestore";

interface MessageProps {
  messages: IMessage;
  ref: any;
  setRepliedMessage: any
  setIsReplying: (name: boolean) => void;
  forceScroll: () => void;
  scrollToFiltered: any
  setSelectedMessage: (name: string) => void;
  roomRef: DocumentReference
  sendEventMessage: (id: string, eventMessage: string) => void
}

const Message: FC<MessageProps> = ({ messages, setRepliedMessage, setIsReplying, forceScroll, scrollToFiltered, setSelectedMessage, roomRef, sendEventMessage }, ref) => {
  const { auth, firestore } = useContext(Context);
  const [user] = useAuthState(auth);
  const { selectedRoom, setSelectedRoom } = useContext(RoomContext);
  const [isHovering, setIsHovering] = useState(false);
  const [modal, setModal] = useState(false);
  const [editedValue, setEditedValue] = useState(messages.text);
  const msgRef = doc(
    firestore,
    `rooms/${selectedRoom}/messages/${messages.docId}`
  );

  const handleMouseOver = () => {
    setIsHovering(true);
  };

  const handleMouseOut = () => {
    setIsHovering(false);
  };
  const openModal = () => {
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
  };
  const replyToMessage = () => {
    setIsReplying(true);
    setRepliedMessage({
      avatar: messages.photoURL,
      displayName: messages.displayName,
      text: messages.text,
      id: messages.docId
    })
    setTimeout(() => {
      forceScroll()
    }, )
  }
  const editMessage = () => {
    closeModal()
    updateDoc(msgRef, {
      text: editedValue,
    });
  };
  const pinMessage = () => {
    updateDoc(msgRef, {
      isPinned: true
    })
    const eventMessage = `${user?.displayName} has pinned a message`
    sendEventMessage(selectedRoom, eventMessage)
    updateDoc(roomRef, {
      timestamp: serverTimestamp()
    })
  }
  const deleteMessage =  async() => {
    await deleteDoc(msgRef)
  }
  const getDocId = () => {
    setSelectedMessage(messages.repliedMessage.id)
        setTimeout(() => {
            scrollToFiltered()
        }, )
  }

  const messageDate = messages.createdAt && messages.createdAt.toDate();
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
      <div ref={ref}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        className={
          user?.uid === messages.uid
            ? `${(cl.my__message, cl.message__wrapper)}`
            : `${(cl.message, cl.message__wrapper)}`
        }
      >{messages.eventMessage ? <div className={cl.event__message__wrapper}>
        <p className={cl.message__text}>{messages.text}</p>
      </div> : <div className={cl.message__column}>
          {messages.repliedMessage && Object.values(messages.repliedMessage).some(x => (x !== null && x !== '')) &&  <div onClick={getDocId} className={cl.messages__replied__message}>
            <Avatar sx={{width: 24, height: 24}} className={cl.chat__replied__message__avatar} src={messages.repliedMessage.avatar} />
            <span className={cl.chat__replied__message__name}>{messages.repliedMessage.displayName}</span>
            <span className={cl.chat__replied__message__text}>{messages.repliedMessage.text}</span>
           </div>}
       
          <div className={cl.message__row}>
            <div className={cl.message__avatar__row}>
              <Avatar className={cl.message__avatar} src={messages.photoURL} />
              <span className={cl.message__displayname}>{messages.displayName}</span>
              <span className={cl.message__date}> {dayDifference > 0 ? fullDate : hoursAndMins}</span>
            </div>
            {isHovering && 
              <div className={cl.message__icons}>
            <div className={cl.message__public__icons}>
                <IconButton className={cl.message__icon__button} onClick={replyToMessage} color="default"><ReplyIcon className={cl.message__icon}/></IconButton>
                <IconButton className={cl.message__icon__button} onClick={pinMessage} color="default"><PushPinIcon className={cl.message__icon}/></IconButton>
              </div>
            {isHovering && user?.uid === messages.uid && (
              <div className={cl.message__private__icons}>
                <IconButton className={cl.message__icon__button} onClick={openModal} color="default"><EditIcon className={cl.message__icon}/></IconButton> 
                <IconButton className={cl.message__icon__button} onClick={deleteMessage} color="default"><DeleteIcon className={cl.message__icon}/></IconButton> 
              </div>
            )}
            </div>}
            <EditMessageModal editedValue={editedValue} setEditedValue={setEditedValue} editMessage={editMessage} modal={modal} closeModal={closeModal}/>
          </div>
          <p className={cl.message__text}>{messages.text}</p>
         {messages.imageURL && <div> <img className={cl.message__img} src={messages.imageURL} alt="" /></div> } 
          
        </div>}
        
      </div>
  );
};
//@ts-ignore
export default forwardRef(Message);
