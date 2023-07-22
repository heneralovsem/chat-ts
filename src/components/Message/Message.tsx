import React, { FC, useContext, useState } from "react";
import { IMessage } from "../../types/types";
import cl from "./Message.module.css";
import { Avatar } from "@mui/material";
import { Context } from "../..";
import { RoomContext } from "../..";
import { useAuthState } from "react-firebase-hooks/auth";
import dayjs from "dayjs";
import { Modal, TextField, Button } from "@mui/material";
import { updateDoc, collection, doc, deleteDoc } from "firebase/firestore";

interface MessageProps {
  messages: IMessage;
}

const Message: FC<MessageProps> = ({ messages }) => {
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
    updateDoc(msgRef, {
      text: editedValue,
    });
  };
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
      <div
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
                <button onClick={deleteMessage}>delete</button>
                <button onClick={openModal}>edit</button>
                <Modal open={modal} onClose={closeModal}>
                  <div className={cl.comment__modal}>
                    <div>
                      {" "}
                      <TextField
                        multiline
                        maxRows={4}
                        value={editedValue}
                        className={cl.modal__text}
                        onChange={(event) => setEditedValue(event.target.value)}
                      ></TextField>{" "}
                    </div>
                    <div>
                      <Button
                        className={cl.modal__btn}
                        variant="outlined"
                        onClick={editMessage}
                      >
                        {" "}
                        Save
                      </Button>
                    </div>
                  </div>
                </Modal>
              </div>
            )}
          </div>
          <p className={cl.message__text}>{messages.text}</p>
        </div>
      </div>
  );
};

export default Message;
