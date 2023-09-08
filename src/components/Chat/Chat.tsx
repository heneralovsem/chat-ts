import React, {
  FC,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Context, RoomContext } from "../..";
import cl from "./Chat.module.css";
import { useCollectionData } from "react-firebase-hooks/firestore";
import {
  TextField,
  Button,
  Modal,
  IconButton,
  InputAdornment,
  Avatar,
} from "@mui/material";
import { collection, updateDoc } from "firebase/firestore";
import { orderBy } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { addDoc, doc, FieldPath, setDoc } from "firebase/firestore";
import { query } from "firebase/firestore";
import { IMessage, IRoom } from "../../types/types";
import Message from "../Message/Message";
import RoomItem from "../RoomItem/RoomItem";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import Loader from "../Loader/Loader";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CreateRoomModal from "../CreateRoomModal/CreateRoomModal";
import MessagesFilter from "../MessagesFilter/MessagesFilter";
import Emojis from "../Emojis/Emojis";
import NewMessage from "../NewMessage/NewMessage";

const Chat: FC = () => {
  const { auth, firestore, storage } = useContext(Context);
  const [user] = useAuthState(auth);
  const [roomName, setRoomName] = useState<string>("");
  const { selectedRoom, setSelectedRoom } = useContext(RoomContext);
  const [selectedRoomName, setSelectedRoomName] = useState<string>("General");
  const [selectedRoomUsers, setSelectedRoomUsers] = useState<Array<any>>([]);
  const [selectedRoomStatus, setSelectedRoomStatus] = useState<
    string | undefined
  >("");
  const [roomStatus, setRoomStatus] = useState<string>("public");
  const [roomMembers, setRoomMembers] = useState<string>("");
  const [roomType, setRoomType] = useState<string>("");
  const [modal, setModal] = useState<boolean>(false);
  const [addUsersModal, setAddUsersModal] = useState<boolean>(false);
  const [addedUsers, setAddedUsers] = useState<string>("");
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = useState<string>("");
  const [repliedMessage, setRepliedMessage] = useState({
    avatar: "",
    displayName: "",
    text: "",
    id: "",
  });
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [contentVisibility, setContentVisibility] = useState<boolean>(true);
  const refTimer = useRef<number | null>(null);
  const roomRef = doc(firestore, `rooms`, selectedRoom);
  const roomCollectionRef = collection(firestore, "rooms");
  const msgCollectionRef = collection(
    firestore,
    `rooms/${selectedRoom}/messages`
  );
  const msgQuery = useMemo(() => {
    const msgQuery = query(msgCollectionRef, orderBy("createdAt"));
    return msgQuery;
  }, [selectedRoom]);
  const lastElement = useRef<HTMLDivElement | any>(null);
  const observer = useRef<IntersectionObserver>();
  const openModal = () => {
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
    setRoomMembers("");
    setRoomStatus("public");
    setRoomName("");
    setRoomType("");
  };
  const closeAddUsersModal = () => {
    setAddUsersModal(false);
  };
  const addUsers = () => {
    updateDoc(roomRef, {
      users: [...selectedRoomUsers, ...addedUsers.split(",")],
    });
    const eventMessage = `${user?.displayName} added ${addedUsers}`;
    sendEventMessage(selectedRoom, eventMessage);
    updateDoc(roomRef, {
      timestamp: serverTimestamp(),
    });
    closeAddUsersModal();
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

  const sendEventMessage = async (id: string, eventMessage: string) => {
    const eventMessageCollectionRef = collection(
      firestore,
      "rooms",
      `${id}`,
      "messages"
    );
    const eventMessageDocRef = doc(eventMessageCollectionRef);
    const eventMessageId = eventMessageDocRef.id;
    await setDoc(
      doc(firestore, "rooms", `${id}`, "messages", `${eventMessageId}`),
      {
        uid: user?.uid,
        displayName: user?.displayName,
        photoURL: user?.photoURL,
        text: eventMessage,
        createdAt: serverTimestamp(),
        docId: eventMessageId,
        eventMessage: true,
      }
    );
  };
  const createRoom = async (e: React.MouseEvent) => {
    if (
      (roomStatus !== "dm" && roomName.trim() !== "") ||
      (roomStatus === "dm" && roomMembers.trim() !== "")
    ) {
      const roomDocRef = doc(roomCollectionRef);
      const id = roomDocRef.id;
      await setDoc(doc(firestore, "rooms", `${id}`), {
        name: roomName,
        status: roomStatus,
        docId: id,
        users: [user?.displayName, ...roomMembers.split(",")],
        timestamp: serverTimestamp(),
      });
      setSelectedRoomName(roomName);
      setSelectedRoom(id);
      const eventMessage = `${user?.displayName} created a room`;
      sendEventMessage(id, eventMessage);
      closeModal();
    }
  };
  const [messages] = useCollectionData<IMessage>(query(msgQuery));
  const refTest = useRef<any | null>(null);
  const closeReply = () => {
    setIsReplying(false);
    setRepliedMessage({
      avatar: "",
      displayName: "",
      text: "",
      id: "",
    });
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
  const scrollToFiltered = () => {
    refTest.current.scrollIntoView({ block: "center" });
    setSelectedMessage("");
  };
  const goBack = () => {
    setContentVisibility(false);
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
      <div
        className={`${cl.chat__rooms}  ${
          !contentVisibility ? cl.rooms__fullwidth : cl.rooms__hidden
        } `}
      >
        {loading && <Loader />}
        {!loading &&
          rooms?.map((room) =>
            room.status === "public" ? (
              <RoomItem
                room={room}
                isScrolling={isScrolling}
                setIsScrolling={setIsScrolling}
                setSelectedRoomName={setSelectedRoomName}
                setSelectedRoomUsers={setSelectedRoomUsers}
                setSelectedRoomStatus={setSelectedRoomStatus}
                key={room.docId}
                setContentVisibility={setContentVisibility}
              />
            ) : (room.status === "private" || room.status === "dm") &&
              room.users?.includes(user?.displayName) ? (
              <RoomItem
                isScrolling={isScrolling}
                setIsScrolling={setIsScrolling}
                setSelectedRoomName={setSelectedRoomName}
                setSelectedRoomUsers={setSelectedRoomUsers}
                setSelectedRoomStatus={setSelectedRoomStatus}
                setContentVisibility={setContentVisibility}
                room={room}
                key={room.docId}
              />
            ) : null
          )}
        {!loading && (
          <div className={cl.icon__wrapper}>
            {" "}
            <IconButton color="primary" onClick={openModal}>
              <AddIcon />
            </IconButton>
          </div>
        )}

        <CreateRoomModal
          roomStatus={roomStatus}
          setRoomStatus={setRoomStatus}
          roomMembers={roomMembers}
          setRoomMembers={setRoomMembers}
          roomName={roomName}
          setRoomName={setRoomName}
          roomType={roomType}
          setRoomType={setRoomType}
          createRoom={createRoom}
          modal={modal}
          closeModal={closeModal}
        />
      </div>
      <div
        className={`${cl.chat__content} ${
          !contentVisibility && cl.chat__hidden__content
        }`}
      >
        <div className={cl.chat__header}>
          <div className={cl.arrowback__icon__wrapper}>
            <div className={cl.arrowback__icon}>
              <IconButton className={cl.chat__header__iconbtn} onClick={goBack}>
                <ArrowBackIcon className={cl.chat__header__icon} />
              </IconButton>
            </div>
            <h2 className={cl.chat__room__name}>{selectedRoomName}</h2>
          </div>

          <div className={cl.chat__header__icons}>
            {selectedRoomStatus === "private" && (
              <IconButton
                className={cl.chat__header__iconbtn}
                onClick={(e) => setAddUsersModal(true)}
                color="default"
              >
                <AddIcon className={cl.chat__header__icon} />
              </IconButton>
            )}

            <Modal open={addUsersModal} onClose={closeAddUsersModal}>
              <div className={cl.modal__container}>
                <div className={cl.close__icon__wrapper}>
                  <IconButton onClick={closeAddUsersModal}>
                    <CloseIcon />
                  </IconButton>
                </div>
                <TextField
                  value={addedUsers}
                  variant="outlined"
                  helperText={"Separate users with comma"}
                  placeholder="Add..."
                  onChange={(e) => setAddedUsers(e.target.value)}
                ></TextField>
                <Button variant="outlined" onClick={addUsers}>
                  Apply
                </Button>
              </div>
            </Modal>
            <MessagesFilter
              scrollToFiltered={scrollToFiltered}
              selectedMessage={selectedMessage}
              setSelectedMessage={setSelectedMessage}
            />
          </div>
        </div>
        <div className={cl.chat__messages}>
          <div className={cl.chat__msgtest}>
            {messages?.map((message) => {
              const refProps =
                selectedMessage === message.docId ? { ref: refTest } : {};
              return (
                <Message
                  {...refProps}
                  scrollToFiltered={scrollToFiltered}
                  roomRef={roomRef}
                  sendEventMessage={sendEventMessage}
                  messages={message}
                  setRepliedMessage={setRepliedMessage}
                  setIsReplying={setIsReplying}
                  forceScroll={forceScroll}
                  setSelectedMessage={setSelectedMessage}
                  key={message.docId}
                />
              );
            })}
            {isVisible && (
              <div className={cl.chat__scrollbtn__wrapper}>
                <div className={cl.chat__scrollbtn}>
                  <IconButton onClick={forceScroll}>
                    <KeyboardArrowDownRoundedIcon />
                  </IconButton>
                </div>
              </div>
            )}

            <div ref={lastElement}></div>
          </div>
        </div>
        <NewMessage msgCollectionRef={msgCollectionRef} forceScroll={forceScroll} roomRef={roomRef} repliedMessage={repliedMessage} isReplying={isReplying} closeReply={closeReply} />
      </div>
    </div>
  );
};

export default Chat;
