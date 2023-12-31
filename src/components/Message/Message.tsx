import React, { FC, forwardRef, useContext, useState } from "react";
import { IMessage, IRepliedMessage } from "../../types/types";
import cl from "./Message.module.css";
import { Avatar, Icon, IconButton } from "@mui/material";
import { Context } from "../..";
import { RoomContext } from "../..";
import { useAuthState } from "react-firebase-hooks/auth";
import dayjs from "dayjs";
import { Modal, TextField, Button, Drawer } from "@mui/material";
import {
  updateDoc,
  collection,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PushPinIcon from "@mui/icons-material/PushPin";
import ReplyIcon from "@mui/icons-material/Reply";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ImageIcon from "@mui/icons-material/Image";
import EditMessageModal from "../EditMessageModal/EditMessageModal";
import { DocumentReference } from "firebase/firestore";
import ImageModal from "../ImageModal/ImageModal";

interface MessageProps {
  messages: IMessage;
  ref: HTMLDivElement | null;
  setRepliedMessage: (name: IRepliedMessage) => void;
  setIsReplying: (name: boolean) => void;
  forceScroll: () => void;
  scrollToFiltered: () => void;
  setSelectedMessage: (name: string) => void;
  roomRef: DocumentReference;
  sendEventMessage: (id: string, eventMessage: string) => void;
}

const Message:  React.ForwardRefRenderFunction<HTMLDivElement , MessageProps> = (
  {
    messages,
    setRepliedMessage,
    setIsReplying,
    forceScroll,
    scrollToFiltered,
    setSelectedMessage,
    roomRef,
    sendEventMessage,
  },
  ref
) => {
  const { auth, firestore } = useContext(Context);
  const [user] = useAuthState(auth);
  const { selectedRoom, setSelectedRoom } = useContext(RoomContext);
  const [isHovering, setIsHovering] = useState(false);
  const [modal, setModal] = useState(false);
  const [imageModal, setImageModal] = useState(false)
  const [drawer, setDrawer] = useState(false);
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
    setDrawer(false)
    setModal(true);
    setTimeout(() => {
      setIsHovering(false)
    })
  };
  const closeModal = () => {
    setModal(false);
    setIsHovering(false)
  };
  const openDrawer = () => {
    setDrawer(true);
    setTimeout(() => {
      setIsHovering(false)
    })
  };
  const closeDrawer = () => {
    setDrawer(false);
    setIsHovering(false)
  };
  const replyToMessage = () => {
    setIsReplying(true);
    setRepliedMessage({
      avatar: messages.photoURL,
      displayName: messages.displayName,
      text: messages.text,
      id: messages.docId,
    });
    setTimeout(() => {
      forceScroll();
    });
    closeDrawer()
  };
  const editMessage = () => {
    closeModal();
    updateDoc(msgRef, {
      text: editedValue,
    });
  };
  const pinMessage = () => {
    updateDoc(msgRef, {
      isPinned: true,
    });
    const eventMessage = `${user?.displayName} pinned a message`;
    sendEventMessage(selectedRoom, eventMessage);
    updateDoc(roomRef, {
      timestamp: serverTimestamp(),
    });
    closeDrawer()
  };
  const deleteMessage = async () => {
    await deleteDoc(msgRef);
    closeDrawer()
  };
  const getDocId = () => {
    setSelectedMessage(messages.repliedMessage?.id!);
    setTimeout(() => {
      scrollToFiltered();
    });
  };

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
      ref={ref}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      className={
        user?.uid === messages.uid
          ? `${(cl.my__message, cl.message__wrapper)}`
          : `${(cl.message, cl.message__wrapper)}`
      }
    >
      {messages.eventMessage ? (
        <div className={cl.event__message__wrapper}>
          <p className={cl.message__text}>{messages.text}</p>
        </div>
      ) : (
        <div className={cl.message__column}>
          {messages.repliedMessage &&
            Object.values(messages.repliedMessage).some(
              (x) => x !== null && x !== ""
            ) && (
              <div className={cl.messages__replied__message}>
                <Avatar
                  sx={{ width: 24, height: 24 }}
                  className={cl.chat__replied__message__avatar}
                  src={messages.repliedMessage.avatar}
                />
                <span className={cl.chat__replied__message__name}>
                  {messages.repliedMessage.displayName}
                </span>
                <span onClick={getDocId} className={cl.messages__replied__message__text}>
                  {messages.repliedMessage.text}
                </span>
                {!messages.repliedMessage.text && <ImageIcon onClick={getDocId} className={cl.replied__message__icon} />}
              </div>
            )}

          <div className={cl.message__row}>
            <div className={cl.message__avatar__row}>
              <Avatar className={cl.message__avatar} src={messages.photoURL} />
              <span className={cl.message__displayname}>
                {messages.displayName}
              </span>
              <span className={cl.message__date}>
                {" "}
                {dayDifference > 0 ? fullDate : hoursAndMins}
              </span>
            </div>
            {isHovering && (
              <div className={cl.message__icons}>
                <div className={cl.message__public__icons}>
                  <IconButton
                    className={cl.message__icon__button}
                    onClick={replyToMessage}
                    color="default"
                  >
                    <ReplyIcon className={cl.message__icon} />
                  </IconButton>
                  <IconButton
                    className={cl.message__icon__button}
                    onClick={pinMessage}
                    color="default"
                  >
                    <PushPinIcon className={cl.message__icon} />
                  </IconButton>
                </div>
                <div className={cl.message__hidden__icons}>
                  <IconButton className={cl.message__more__icon__button} onClick={openDrawer}>
                    <MoreHorizIcon className={cl.message__more__icon} />
                  </IconButton>
                </div>
                {isHovering && user?.uid === messages.uid && (
                  <div className={cl.message__private__icons}>
                    <IconButton
                      className={cl.message__icon__button}
                      onClick={openModal}
                      color="default"
                    >
                      <EditIcon className={cl.message__icon} />
                    </IconButton>
                    <IconButton
                      className={cl.message__icon__button}
                      onClick={deleteMessage}
                      color="default"
                    >
                      <DeleteIcon className={cl.message__icon} />
                    </IconButton>
                  </div>
                )}
              </div>
            )}
            <Drawer
              anchor="bottom"
              open={drawer}
              onClose={closeDrawer}
            >
              <div className={cl.drawer__icons}>
                <div className={cl.drawer__public__icons}>
                  <div className={cl.drawer__icon__wrapper}>
                  <IconButton
                    className={cl.drawer__icon__button}
                    onClick={replyToMessage}
                    color="default"
                  >
                    <ReplyIcon className={cl.drawer__icon} />
                  </IconButton>
                  <span className={cl.icon__description}>Reply</span>
                  </div>
                  <div className={cl.drawer__icon__wrapper}>
                  <IconButton
                    className={cl.drawer__icon__button}
                    onClick={pinMessage}
                    color="default"
                  >
                    <PushPinIcon className={cl.drawer__icon} />
                  </IconButton>
                  <span className={cl.icon__description}>Pin message</span>
                  </div>
                </div>
                {user?.uid === messages.uid && (
                  <div className={cl.drawer__private__icons}>
                    <div className={cl.drawer__icon__wrapper}>
                    <IconButton
                      className={cl.drawer__icon__button}
                      onClick={openModal}
                      color="default"
                    >
                      <EditIcon className={cl.drawer__icon} />
                    </IconButton>
                    <span className={cl.icon__description}>Edit message</span>
                    </div>
                    <div className={cl.drawer__icon__wrapper}>
                    <IconButton
                      className={cl.drawer__icon__button}
                      onClick={deleteMessage}
                      color="default"
                    >
                      <DeleteIcon className={cl.drawer__icon} />
                    </IconButton>
                    <span className={cl.icon__description}>Delete message</span>
                    </div>
                  </div>
                )}
              </div>
            </Drawer>
            <EditMessageModal
              editedValue={editedValue}
              setEditedValue={setEditedValue}
              editMessage={editMessage}
              modal={modal}
              closeModal={closeModal}
            />
          </div>
          <p className={cl.message__text}>{messages.text}</p>
          {messages.imageURL && (
            <div>
              {" "}
              <img onClick={() => setImageModal(true)} className={cl.message__img} src={messages.imageURL} alt="" />
            </div>
          )}
          <ImageModal imageModal={imageModal} setImageModal={setImageModal} imageURL={messages.imageURL} />
        </div>
      )}
    </div>
  );
};

export default forwardRef(Message);
