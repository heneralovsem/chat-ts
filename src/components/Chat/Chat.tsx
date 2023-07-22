import React, { FC, useContext, useEffect, useRef, useState, MutableRefObject } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Context, RoomContext } from "../..";
import cl from "./Chat.module.css";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { TextField, Button, Avatar, Modal } from "@mui/material";
import { collection, documentId, updateDoc,  } from "firebase/firestore";
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
  const [isScrolling, setIsScrolling] = useState<boolean>(false)
  const roomRef = doc(firestore, `rooms`, selectedRoom)
  const msgCollectionRef = collection(firestore,`rooms/${selectedRoom}/messages` )
  const lastElement = useRef<HTMLDivElement | any>(null)
  const observer = useRef<IntersectionObserver >()
  
  const openModal = () => {
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
  };
  const scrolling = () => {
    setIsScrolling(true)
  }
  console.log(isScrolling)
  const sendMessage = async () => {
    const msgDocRef = doc(msgCollectionRef)
    const id = msgDocRef.id
    await setDoc(doc(firestore, `rooms/${selectedRoom}/messages`, `${id}`), {
      uid: user?.uid,
      displayName: user?.displayName,
      photoURL: user?.photoURL,
      text: value,
      createdAt: serverTimestamp(),
      docId: id
       
    });
    setValue("");
    updateDoc(roomRef, {
      timestamp: serverTimestamp()
    })
  };
  const createRoom = async (e: React.MouseEvent) => {
    await setDoc(doc(firestore, "rooms", `${roomName}`), {
      name: roomName,
      status: roomStatus,
      users: [user?.displayName, ...roomMembers.split(",")],
      timestamp: serverTimestamp(),
    });
    closeModal()
  };
  const [messages, loading] = useCollectionData<IMessage>(
    query(
      collection(firestore, `rooms/${selectedRoom}/messages`),
      orderBy("createdAt"),
    )
  );
  const [rooms] = useCollectionData<IRoom>(
    query(collection(firestore, `rooms`), orderBy("timestamp", 'desc')),
  );
  // const element = document.getElementById("test");
  const scrollToBottom = () => {
    if (!isScrolling) {
      lastElement.current?.scrollIntoView()
    }
    
  }
  useEffect(() => {
      scrollToBottom()
  }, [messages])
  useEffect(() => {
    if(observer.current) observer.current.disconnect()
  var callback = function(entries:any, observer:any) {
      if (entries[0].isIntersecting) {
        setIsScrolling(false)
      }
  };
  observer.current = new IntersectionObserver(callback);
  observer.current.observe(lastElement.current)
  })
  return (
    <div className={cl.chat__wrapper}>
      <div className={cl.chat__rooms}>
        {rooms?.map((room) =>
          room.status === "public" ? (
            <RoomItem room={room} isScrolling={isScrolling} setIsScrolling={setIsScrolling} key={room.name} />
          ) : room.status === "private" &&
            room.users?.includes(user?.displayName) ? (
            <RoomItem isScrolling={isScrolling} setIsScrolling={setIsScrolling} room={room} key={room.name} />
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
        <div className={cl.chat__header}>
          <h1>{selectedRoom}</h1>
        </div>
        <div onScroll={scrolling} className={cl.chat__messages}>
          <div className={cl.chat__msgtest}>
          {messages?.map((message) => (
            <Message messages={message}  key={message.docId} />
          ))}
          <div ref={lastElement}></div>
          </div>
          
        </div>
        <div className={cl.chat__new__message}>
        <TextField
          value={value}
          onChange={(e) => setValue(e.target.value)}
          fullWidth
          maxRows={2}
          size="small"
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
    </div>
  );
};

export default Chat;
