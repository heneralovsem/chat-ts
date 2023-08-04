import React, { FC, useContext, useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Context, RoomContext } from "../..";
import cl from "./Chat.module.css";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { TextField, Button, Modal, IconButton } from "@mui/material";
import { collection, updateDoc, where } from "firebase/firestore";
import { orderBy } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { addDoc, doc, FieldPath, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { query } from "firebase/firestore";
import { IMessage, IRoom } from "../../types/types";
import Message from "../Message/Message";
import RoomItem from "../RoomItem/RoomItem";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import Loader from "../Loader/Loader";
import PushPinIcon from "@mui/icons-material/PushPin";
import FilteredMessage from "../FilteredMessage/FilteredMessage";
import CreateRoomModal from "../CreateRoomModal/CreateRoomModal";

const Chat: FC = () => {
  const { auth, firestore, storage } = useContext(Context);
  const [user] = useAuthState(auth);
  const [value, setValue] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const { selectedRoom, setSelectedRoom } = useContext(RoomContext);
  const [roomStatus, setRoomStatus] = useState<string>("public");
  const [roomMembers, setRoomMembers] = useState<string>("");
  const [modal, setModal] = useState<boolean>(false);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isShowPinned, setIsShowPinned] = useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = useState<string>("");
  const refTimer = useRef<number | null>(null);
  const roomRef = doc(firestore, `rooms`, selectedRoom);
  const msgCollectionRef = collection(
    firestore,
    `rooms/${selectedRoom}/messages`
  );
  const lastElement = useRef<HTMLDivElement | any>(null);
  const observer = useRef<IntersectionObserver>();
  const [file, setFile] = useState<File | null>(null);
  console.log(file);
  console.log(selectedMessage);
  const openModal = () => {
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
  };
  const showButton = () => {
    if (refTimer.current !== null) return;
    setIsRunning(true);
    refTimer.current = window.setTimeout(() => {
      setIsVisible(true);
      setIsRunning(false);
    }, 3000);
  };
  const stopTimeout = () => {
    if (refTimer.current === null) return;
    window.clearTimeout(refTimer.current);
    refTimer.current = null;
    setIsRunning(false);
  };

  console.log(isVisible);
  const sendMessage = async () => {
    const msgDocRef = doc(msgCollectionRef);
    const id = msgDocRef.id;
    if (file) {
      const imageRef = ref(storage, `images/${file.name}`);
      console.log(imageRef);
      const onSnapshot = await uploadBytes(imageRef, file);
      const imgURL = await getDownloadURL(onSnapshot.ref);
      setDoc(doc(firestore, `rooms/${selectedRoom}/messages`, `${id}`), {
        uid: user?.uid,
        displayName: user?.displayName,
        photoURL: user?.photoURL,
        text: value,
        createdAt: serverTimestamp(),
        docId: id,
        isPinned: false,
        imageURL: imgURL,
      });
    } else {
      setDoc(doc(firestore, `rooms/${selectedRoom}/messages`, `${id}`), {
        uid: user?.uid,
        displayName: user?.displayName,
        photoURL: user?.photoURL,
        text: value,
        createdAt: serverTimestamp(),
        docId: id,
        isPinned: false,
        imageURL: null,
      });
    }
    setValue("");
    updateDoc(roomRef, {
      timestamp: serverTimestamp(),
    });
  };
  const sendOnEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };
  const createRoom = async (e: React.MouseEvent) => {
    await setDoc(doc(firestore, "rooms", `${roomName}`), {
      name: roomName,
      status: roomStatus,
      users: [user?.displayName, ...roomMembers.split(",")],
      timestamp: serverTimestamp(),
    });
    closeModal();
  };
  const [pinnedMessages] = useCollectionData<IMessage>(
    query(
      collection(firestore, `rooms/${selectedRoom}/messages`),
      where("isPinned", "==", true),
      orderBy("createdAt")
    )
  );
  const [messages] = useCollectionData<IMessage>(
    query(
      collection(firestore, `rooms/${selectedRoom}/messages`),
      orderBy("createdAt")
    )
  );
  const refTest = useRef<any | null>(null);
  const showPinned = () => {
    setIsShowPinned(!isShowPinned);
    console.log(refTest.current);
    //@ts-ignore
  };
  const [rooms, loading] = useCollectionData<IRoom>(
    query(collection(firestore, `rooms`), orderBy("timestamp", "desc"))
  );
  const scrollToBottom = () => {
    if (!isScrolling) {
      setTimeout(() => {
        lastElement.current?.scrollIntoView();
      }, 10);
    }
  };
  const forceScroll = () => {
    lastElement.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToPinned = () => {
    refTest.current.scrollIntoView({ block: "center" });
    setSelectedMessage("");
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    // @ts-ignore
    var callback = function (entries, observer) {
      if (entries[0].isIntersecting) {
        setIsScrolling(false);
        setIsVisible(false);
        stopTimeout();
      }
      if (!entries[0].isIntersecting) {
        setIsScrolling(true);
        showButton();
      }
    };
    observer.current = new IntersectionObserver(callback);
    observer.current.observe(lastElement.current);
  }, [isVisible, messages]);
  return (
    <div className={cl.chat__wrapper}>
      <div className={cl.chat__rooms}>
        {loading && <Loader />}
        {!loading &&
          rooms?.map((room) =>
            room.status === "public" ? (
              <RoomItem
                room={room}
                isScrolling={isScrolling}
                setIsScrolling={setIsScrolling}
                key={room.name}
              />
            ) : room.status === "private" || room.status === 'dm' &&
              room.users?.includes(user?.displayName) ? (
              <RoomItem
                isScrolling={isScrolling}
                setIsScrolling={setIsScrolling}
                room={room}
                key={room.name}
              />
            ) : null
          )}
        <button onClick={openModal}>New room...</button>
        <CreateRoomModal
          roomStatus={roomStatus}
          setRoomStatus={setRoomStatus}
          roomMembers={roomMembers}
          setRoomMembers={setRoomMembers}
          roomName={roomName}
          setRoomName={setRoomName}
          createRoom={createRoom}
          modal={modal}
          closeModal={closeModal}
        />
      </div>
      <div className={cl.chat__content}>
        <div className={cl.chat__header}>
          <h1>{selectedRoom}</h1>
          <div className={cl.chat__header__icons}>
            <IconButton
              className={cl.pin__icon}
              onClick={showPinned}
              color="default"
            >
              <PushPinIcon />
            </IconButton>
            {isShowPinned && (
              <div className={cl.chat__pinned__messages}>
                <h1>Pinned messages</h1>
                {pinnedMessages?.map((message) => (
                  //@ts-ignore
                  <FilteredMessage
                    scrollToPinned={scrollToPinned}
                    selectedMessage={selectedMessage}
                    setSelectedMessage={setSelectedMessage}
                    message={message}
                    key={message.docId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={cl.chat__messages}>
          <div className={cl.chat__msgtest}>
            {messages?.map((message) => {
              const refProps =
                selectedMessage === message.docId ? { ref: refTest } : {};
              return (
                <Message {...refProps} messages={message} key={message.docId} />
              );
            })}
            {isVisible && (
              <div className={cl.chat__scrollbtn__wrapper}>
                <button onClick={forceScroll} className={cl.chat__scrollbtn}>
                  <KeyboardArrowDownRoundedIcon fontSize="small" />
                </button>
              </div>
            )}

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
          <input
            type="file"
            onChange={(event) => {
              //@ts-ignore
              setFile(event.target.files?.[0]);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
