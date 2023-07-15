import React, { FC, useContext, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Context, RoomContext } from "../..";
import cl from "./Chat.module.css";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { TextField, Button, Avatar, Modal } from "@mui/material";
import { collection, updateDoc } from "firebase/firestore";
import { orderBy } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { addDoc, doc, FieldPath, setDoc } from "firebase/firestore";
import { query } from "firebase/firestore";
import { IMessage, IRoom } from "../../types/types";
import Message from "../Message/Message";
import RoomItem from "../RoomItem/RoomItem";

const Chat: FC = () => {
  const { auth, firestore } = useContext(Context);
  const [user] = useAuthState(auth);
  const [value, setValue] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const { selectedRoom, setSelectedRoom } = useContext(RoomContext);
  const [roomStatus, setRoomStatus] = useState<string>("public");
  const [roomMembers, setRoomMembers] = useState<string>("");
  const [modal, setModal] = useState<boolean>(false);
  const openModal = () => {
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
  };
  console.log(roomStatus);
  const sendMessage = async () => {
    await addDoc(collection(firestore, `rooms/${selectedRoom}/messages`), {
      uid: user?.uid,
      displayName: user?.displayName,
      photoURL: user?.photoURL,
      text: value,
      createdAt: serverTimestamp(),
    });
    setValue("");
  };
  const createRoom = async (e: React.MouseEvent) => {
    await setDoc(doc(firestore, "rooms", `${roomName}`), {
      name: roomName,
      status: roomStatus,
      users: [user?.displayName, ...roomMembers.split(",")],
      createdAt: serverTimestamp(),
    });
  };

  const [rooms] = useCollectionData<IRoom>(
    query(collection(firestore, `rooms`), orderBy("createdAt"))
  );
  console.log(rooms);
  const [messages, loading] = useCollectionData<IMessage>(
    query(
      collection(firestore, `rooms/${selectedRoom}/messages`),
      orderBy("createdAt")
    )
  );

  return (
    <div className={cl.chat__wrapper}>
      <div className={cl.chat__rooms}>
        {rooms?.map((room) =>
          room.status === "public" ? (
            <RoomItem room={room} key={room.createdAt} />
          ) : room.status === "private" &&
            room.users?.includes(user?.displayName) ? (
            <RoomItem room={room} key={room.createdAt} />
          ) : null
        )}
        <button onClick={openModal}>New room...</button>
        <Modal open={modal} onClose={closeModal}>
          <div className={cl.modal__container}>
            <input
              type="radio"
              name="status"
              id="public"
              checked={roomStatus === "public"}
              value={"public"}
              onChange={(e) => setRoomStatus(e.target.value)}
            />
            <label htmlFor="public">Public</label>
            <input
              type="radio"
              name="status"
              id="private"
              checked={roomStatus === "private"}
              value={"private"}
              onChange={(e) => setRoomStatus(e.target.value)}
            />
            <label htmlFor="private">Private</label>
            {roomStatus === "private" && (
              <TextField
                value={roomMembers}
                onChange={(e) => setRoomMembers(e.target.value)}
                fullWidth
                maxRows={2}
                className={cl.chat__input}
                placeholder="Invite..."
                variant="outlined"
              />
            )}
            <TextField
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              fullWidth
              maxRows={2}
              className={cl.chat__input}
              placeholder="Room name..."
              variant="outlined"
            />
            <Button variant="outlined" onClick={createRoom}>
              Create room
            </Button>
          </div>
        </Modal>
      </div>
      <div className={cl.chat__content}>
        <div className={cl.chat__messages}>
          {messages?.map((message) => (
            <Message messages={message} key={message.createdAt} />
          ))}
        </div>
      </div>
      <div className={cl.chat__new__message}>
        <TextField
          value={value}
          onChange={(e) => setValue(e.target.value)}
          fullWidth
          maxRows={2}
          className={cl.chat__input}
          placeholder="Your message..."
          variant="outlined"
        />
        <Button
          onClick={sendMessage}
          className={cl.chat__btn}
          variant="outlined"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default Chat;
