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
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { query } from "firebase/firestore";
import { IMessage, IRoom } from "../../types/types";
import { v4 as uuidv4 } from "uuid";
import Message from "../Message/Message";
import RoomItem from "../RoomItem/RoomItem";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import Loader from "../Loader/Loader";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import MoodIcon from "@mui/icons-material/Mood";
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreateRoomModal from "../CreateRoomModal/CreateRoomModal";
import MessagesFilter from "../MessagesFilter/MessagesFilter";
import Emojis from "../Emojis/Emojis";

const Chat: FC = () => {
  const { auth, firestore, storage } = useContext(Context);
  const [user] = useAuthState(auth);
  const [value, setValue] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const { selectedRoom, setSelectedRoom } = useContext(RoomContext);
  const [selectedRoomName, setSelectedRoomName] = useState<string>("General");
  const [selectedRoomUsers, setSelectedRoomUsers] = useState<Array<any>>([]);
  const [selectedRoomStatus, setSelectedRoomStatus] = useState<
    string | undefined
  >("");
  const [roomStatus, setRoomStatus] = useState<string>("public");
  const [roomMembers, setRoomMembers] = useState<string>("");
  const [roomType, setRoomType] = useState<string>('')
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
  const [showEmojis, setShowEmojis] = useState<boolean>(false);
  const [contentVisibility, setContentVisibility] = useState<boolean>(true)
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
  console.log(selectedRoom);
  console.log(typeof roomRef);
  const lastElement = useRef<HTMLDivElement | any>(null);
  const observer = useRef<IntersectionObserver>();
  const [file, setFile] = useState<File | null | undefined>(null);
  const [fileLoading, setFileLoading] = useState<number>(0);
  const openModal = () => {
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
    setRoomMembers("");
    setRoomStatus("public");
    setRoomName("");
    setRoomType("")
  };
  const closeAddUsersModal = () => {
    setAddUsersModal(false);
  };
  const addUsers = () => {
    updateDoc(roomRef, {
      users: [...selectedRoomUsers, ...addedUsers.split(",")],
    });
    const eventMessage = `${user?.displayName} has added ${addedUsers}`;
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

  const sendMessage = async () => {
    if (value.trim() !== "" || file) {
      const msgDocRef = doc(msgCollectionRef);
      const id = msgDocRef.id;
      if (file) {
        const imageRef = ref(storage, `images/${uuidv4()}-${file.name}`);
        console.log(imageRef);
        const onSnapshot = await uploadBytesResumable(imageRef, file);
        const progress =
          (onSnapshot.bytesTransferred / onSnapshot.totalBytes) * 100;
        setFileLoading(progress);
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
          repliedMessage: repliedMessage,
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
          repliedMessage: repliedMessage,
        });
      }
      setValue("");
      setFile(null);
      setFileLoading(0);
      closeReply();
      updateDoc(roomRef, {
        timestamp: serverTimestamp(),
      });
    }
  };
  const sendOnEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
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
      const eventMessage = `${user?.displayName} has created a room`;
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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0]);
    e.target.value = "";
    setTimeout(() => {
      forceScroll();
    });
  };
  const goBack = () => {
    setContentVisibility(false)
  }
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
      <div className={ `${cl.chat__rooms}  ${!contentVisibility ? cl.rooms__fullwidth : cl.rooms__hidden} `}>
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
      <div className={`${cl.chat__content} ${!contentVisibility && cl.chat__hidden__content}`}>
        <div className={cl.chat__header}>
          <div className={cl.arrowback__icon__wrapper}>
            <div className={cl.arrowback__icon}><IconButton className={cl.chat__header__iconbtn} onClick={goBack}><ArrowBackIcon className={cl.chat__header__icon} /></IconButton></div>
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
              <div className={cl.close__icon__wrapper}><IconButton onClick={closeAddUsersModal} ><CloseIcon/></IconButton></div>
                <TextField
                  value={addedUsers}
                  variant="outlined"
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
        <div className={cl.chat__new__message}>
          {isReplying && (
            <div className={cl.chat__replied__message}>
              <span>Replying to</span>
              <Avatar
                sx={{ width: 24, height: 24 }}
                className={cl.chat__replied__message__avatar}
                src={repliedMessage.avatar}
              />
              <span className={cl.chat__replied__message__name}>
                {repliedMessage.displayName}
              </span>
              <span className={cl.chat__replied__message__text}>
                {repliedMessage.text}
              </span>
              <button onClick={closeReply}>close</button>
            </div>
          )}
          {file && (
            <div className={cl.chat__fileupload}>
              <p className={cl.file__name}>{file.name}</p>
              <span className={cl.file__loading__progress}>
                Loading... {fileLoading}%
              </span>
            </div>
          )}
          <div className={cl.chat__send__wrapper}>
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton color="primary" component="label">
                      <input
                        hidden
                        accept="image/*"
                        id="icon__button"
                        type="file"
                        onChange={
                          handleFileChange
                          // setFile(event.target.files?.[0]);
                        }
                        // onClick={(e:React.MouseEvent<HTMLInputElement>) => {
                        //   e.currentTarget.value = ''
                        // }}
                      />
                      <label htmlFor="icon__button"></label>

                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: (
                  <>
                    <InputAdornment position="start">
                      <IconButton
                        color="primary"
                        onClick={(e) => setShowEmojis(!showEmojis)}
                      >
                        <MoodIcon />
                      </IconButton>
                      {showEmojis && (
                        <Emojis
                          value={value}
                          setValue={setValue}
                          setShowEmojis={setShowEmojis}
                        />
                      )}
                    </InputAdornment>
                    <InputAdornment position="end">
                      <IconButton color="primary" onClick={sendMessage}>
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  </>
                ),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
