import React, { FC, forwardRef, useContext, useState } from "react";
import { IMessage } from "../../types/types";
import cl from "./Message.module.css";
import { Avatar, IconButton } from "@mui/material";
import { Context } from "../..";
import { RoomContext } from "../..";
import { useAuthState } from "react-firebase-hooks/auth";
import dayjs from "dayjs";
import { Modal, TextField, Button } from "@mui/material";
import { updateDoc, collection, doc, deleteDoc } from "firebase/firestore";
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import EditMessageModal from "../EditMessageModal/EditMessageModal";

interface MessageProps {
  messages: IMessage;
  ref: any;
}

const Message: FC<MessageProps> = ({ messages }, ref) => {
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
  }
  const deleteMessage =  async() => {
    await deleteDoc(msgRef)
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
      >
        <div className={cl.message__column}>
          <div className={cl.message__row}>
            <div className={cl.message__avatar__row}>
              <Avatar src={messages.photoURL} />
              <span>{messages.displayName}</span>
              <span> {dayDifference > 0 ? fullDate : hoursAndMins}</span>
            </div>
            {isHovering && user?.uid === messages.uid && (
              <div className={cl.message__icons}>
                <IconButton className={cl.delete__icon} onClick={pinMessage} color="default"><PushPinIcon /></IconButton>
               <IconButton className={cl.edit__icon} onClick={openModal} color="default"><EditIcon/></IconButton> 
               <IconButton className={cl.delete__icon} onClick={deleteMessage} color="default"><DeleteIcon /></IconButton> 
              </div>
            )}
            <EditMessageModal editedValue={editedValue} setEditedValue={setEditedValue} editMessage={editMessage} modal={modal} closeModal={closeModal}/>
          </div>
          <p className={cl.message__text}>{messages.text}</p>
         {messages.imageURL && <div> <img className={cl.message__img} src={messages.imageURL} alt="" /></div> } 
          
        </div>
      </div>
  );
};
//@ts-ignore
export default forwardRef(Message);
