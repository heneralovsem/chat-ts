import React, { FC, useContext, useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Context, RoomContext } from "../..";
import cl from "./Chat.module.css";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { TextField, Button, Modal, IconButton, InputAdornment, Select, SelectChangeEvent, MenuItem, FormControl, InputLabel, Avatar } from "@mui/material";
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
  const [selectedRoomName, setSelectedRoomName] = useState<string>('General')
  const [roomStatus, setRoomStatus] = useState<string>("public");
  const [roomMembers, setRoomMembers] = useState<string>("");
  const [modal, setModal] = useState<boolean>(false);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isShowPinned, setIsShowPinned] = useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = useState<string>("");
  const [filterType, setFilterType] = useState<string>('from:user')
  const [searchInpValue, setSearchInpValue] = useState<string>('')
  const [searchedValue, setSearchedValue] = useState<string>('')
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [repliedMessage, setRepliedMessage] = useState({
    avatar: '',
    displayName: '',
    text: '',
  })
  const [isReplying, setIsReplying] = useState<boolean>(false)
  const refTimer = useRef<number | null>(null);
  const roomRef = doc(firestore, `rooms`, selectedRoom);
  const roomCollectionRef = collection(firestore, 'rooms')
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
        repliedMessage: repliedMessage
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
        repliedMessage: repliedMessage
      });
    }
    setValue("");
    setFile(null)
    closeReply()
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
    const roomDocRef = doc(roomCollectionRef);
    const id = roomDocRef.id
    await setDoc(doc(firestore, "rooms", `${id}`), {
      name: roomName,
      status: roomStatus,
      docId: id,
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
  const [fromUser] = useCollectionData<IMessage>(
    query(
      collection(firestore, `rooms/${selectedRoom}/messages`),
      where("displayName", "==", searchedValue),
      orderBy("createdAt")
    )
  );
  const [hasLink] = useCollectionData<IMessage>(
    query(
      collection(firestore, `rooms/${selectedRoom}/messages`),
      where("imageURL", '!=', null  ),
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
    setIsSearching(false)
    if (filterType === 'pinned') {
      setFilterType('from:user')
    }
    else {
      setFilterType('pinned')
    }
    console.log(refTest.current);
  };
  const selectHandler = (e: SelectChangeEvent) => {
     setFilterType(e.target.value)
     setSearchInpValue('')
     setIsSearching(false)
     setIsShowPinned(false)
  }
  const searchOnEnter = (e: React.KeyboardEvent) => {
   if (e.key === "Enter") {
    setIsSearching(true);
    setSearchedValue(searchInpValue)
   }
  }
  const closeReply = () => {
    setIsReplying(false);
    setRepliedMessage({
      avatar: '',
      displayName:'',
      text: '',
    })
  }
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
                setSelectedRoomName={setSelectedRoomName}
                key={room.name}
              />
            ) : (room.status === "private" || room.status === 'dm') &&
              room.users?.includes(user?.displayName) ? (
              <RoomItem
                isScrolling={isScrolling}
                setIsScrolling={setIsScrolling}
                setSelectedRoomName={setSelectedRoomName}
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
          <h1>{selectedRoomName}</h1>
          <div className={cl.chat__header__icons}>
            <IconButton
              className={cl.pin__icon}
              onClick={showPinned}
              color="default"
            >
              <PushPinIcon />
              
            </IconButton>
            {/* <Select
            className={cl.chat__select}
            size="small"
            value={filterType}
            onChange={(e: SelectChangeEvent) => setFilterType(e.target.value)}
            >
              <MenuItem value={''}>
               <em>None</em> 
                </MenuItem>
              <MenuItem value={`has:file`}>has:file</MenuItem>
              <MenuItem value={`from:user`}>from:user</MenuItem>
            </Select> */}
            <FormControl size="small">
        <InputLabel id="demo-simple-select-helper-label">Filter by</InputLabel>
        <Select
          className={cl.chat__select}
          labelId="demo-simple-select-helper-label"
          
          value={filterType}
          label="Filter by"
          size="small"
          onChange={selectHandler}
        >
          <MenuItem value={'from:user'}>from:user</MenuItem>
          <MenuItem value={'has:file'}>has:file</MenuItem>
          <MenuItem value={'pinned'}>pinned</MenuItem>
        </Select>
      </FormControl>
            <TextField className={cl.chat__search} onKeyUp={searchOnEnter} value={searchInpValue} onChange={(e) => setSearchInpValue(e.target.value)} size="small" variant="outlined" label={filterType} placeholder="Search..."
             disabled={filterType !== 'from:user'}
            />
            {filterType === 'pinned' && (
              <div className={cl.chat__pinned__messages}>
                <h2 className={cl.chat__filter__type}>Pinned messages</h2>
                {pinnedMessages?.map((message) => (
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
            {isSearching && filterType === 'from:user' && (
              <div className={cl.chat__pinned__messages}>
                <h2 className={cl.chat__filter__type}>Messages from {searchedValue}</h2>
                {fromUser?.map((message) => (
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
            {filterType === 'has:file' && (
              <div className={cl.chat__pinned__messages}>
                <h2 className={cl.chat__filter__type}>Messages with file</h2>
                {hasLink?.sort((a, b) => b.createdAt - a.createdAt)?.map((message) => (
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
                <Message {...refProps} messages={message} setRepliedMessage={setRepliedMessage} setIsReplying={setIsReplying} key={message.docId} />
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
          {isReplying &&
           <div className={cl.chat__replied__message}>
            <span>Replying to</span>
            <Avatar sx={{width: 24, height: 24}} className={cl.chat__replied__message__avatar} src={repliedMessage.avatar} />
            <span className={cl.chat__replied__message__name}>{repliedMessage.displayName}</span>
            <span className={cl.chat__replied__message__text}>{repliedMessage.text}</span>
            <button onClick={closeReply}>close</button>
           </div>
          }
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
    </div>
  );
};

export default Chat;
