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
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

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
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const refTimer = useRef<number | null>(null)
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
  const showButton = () => {
    if (refTimer.current !== null) return;
    setIsRunning(true);
    refTimer.current = window.setTimeout(() => {
      setIsVisible(true);
      setIsRunning(false)
    }, 3000)
  }
  const stopTimeout = () => {
    if (refTimer.current === null) return;
    window.clearTimeout(refTimer.current)
    refTimer.current = null;
    setIsRunning(false)
  }
  
  console.log(isVisible)
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
  const sendOnEnter = (e:React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  } 
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
  const [rooms, roomsLoading] = useCollectionData<IRoom>(
    query(collection(firestore, `rooms`), orderBy("timestamp", 'desc')),
  );
  // const element = document.getElementById("test");
  const scrollToBottom = () => {
    if (!isScrolling) {
      setTimeout(() => {
        lastElement.current?.scrollIntoView()
      }, 10 )
      
    }
 console.log(roomsLoading)   
  }
  const forceScroll = () => {
    lastElement.current?.scrollIntoView({ behavior: "smooth"})
  }
  useEffect(() => {
      scrollToBottom()
  }, [messages])
  useEffect(() => {
    if(observer.current) observer.current.disconnect()
    // @ts-ignore
  var callback = function(entries, observer) {
      if (entries[0].isIntersecting) {
        setIsScrolling(false)
        setIsVisible(false)
        stopTimeout()
      }
      if (!entries[0].isIntersecting) {
        showButton()
      }
  };
  observer.current = new IntersectionObserver(callback);
  observer.current.observe(lastElement.current)
  }, [isVisible, messages] )
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
          {isVisible && <div className={cl.chat__scrollbtn__wrapper}>
            <button onClick={forceScroll} className={cl.chat__scrollbtn}><KeyboardArrowDownRoundedIcon fontSize="small"/></button>
            </div> }
            
          <div ref={lastElement}></div>
          </div>
          
        </div>
        <div className={cl.chat__new__message}>
        <TextField
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyUp={sendOnEnter}
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
