import React, { FC, useState, useContext } from "react";
import cl from "./NewMessage.module.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { Context } from "../..";
import { RoomContext } from "../..";
import { uploadBytesResumable, getDownloadURL, ref } from "firebase/storage";
import {
  setDoc,
  doc,
  updateDoc,
  DocumentReference,
  CollectionReference,
  serverTimestamp,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { IconButton, Avatar, TextField, InputAdornment } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoodIcon from "@mui/icons-material/Mood";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import Emojis from "../Emojis/Emojis";

interface NewMessageProps {
  msgCollectionRef: CollectionReference;
  forceScroll: any;
  repliedMessage: any;
  roomRef: DocumentReference;
  isReplying: boolean;
  closeReply: () => void;
}

const NewMessage: FC<NewMessageProps> = ({
  msgCollectionRef,
  forceScroll,
  repliedMessage,
  roomRef,
  closeReply,
  isReplying,
}) => {
  const { auth, firestore, storage } = useContext(Context);
  const [user] = useAuthState(auth);
  const { selectedRoom, setSelectedRoom } = useContext(RoomContext);
  const [value, setValue] = useState<string>("");
  const [showEmojis, setShowEmojis] = useState<boolean>(false);
  const [file, setFile] = useState<File | null | undefined>(null);
  const [fileLoading, setFileLoading] = useState<number>(0);

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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0]);
    e.target.value = "";
    setTimeout(() => {
      forceScroll();
    });
  };

  return (
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
          <IconButton
            className={cl.replied__message__iconbtn}
            onClick={closeReply}
          >
            <CloseIcon className={cl.replied__message__icon} />
          </IconButton>
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
  );
};

export default NewMessage;
