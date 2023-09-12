import React, { FC, useState, useContext } from "react";
import { Modal, TextField, Button } from "@mui/material";
import cl from "./CreateRoomModal.module.css";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import { useAuthState } from "react-firebase-hooks/auth";
import { Context } from "../..";
import { setDoc, doc, serverTimestamp, CollectionReference } from "firebase/firestore";

interface createRoomModalProps {
  roomCollectionRef: CollectionReference
  setModal: (name: boolean) => void
  modal: boolean;
  setSelectedRoom: (name: string) => void;
  setSelectedRoomName: (name: string) => void;
  sendEventMessage: (id: string, eventMessage: string) => void;
}
const CreateRoomModal: FC<createRoomModalProps> = ({
  roomCollectionRef,
  setSelectedRoomName,
  setSelectedRoom,
  sendEventMessage,
  modal,
  setModal,
}) => {
  const { auth, firestore } = useContext(Context);
  const [user] = useAuthState(auth);
  const [error, setError] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>("");
  const [roomStatus, setRoomStatus] = useState<string>("public");
  const [roomMembers, setRoomMembers] = useState<string>("");
  const [roomType, setRoomType] = useState<string>("");
  const selectDirectMessage = () => {
    setRoomType("directMessage");
    setRoomStatus("dm");
  };
  const createRoom = async () => {
    if (
      (roomStatus !== "dm" && roomName.trim() !== "") ||
      (roomStatus === "dm" && roomMembers.trim() !== "")
    ) {
      const roomDocRef = doc(roomCollectionRef);
      const id = roomDocRef.id;
      const trimmedRoomMembers = roomMembers.split(',').map(element => {
        return element.trim()
      })
      await setDoc(doc(firestore, "rooms", `${id}`), {
        name: roomName,
        status: roomStatus,
        docId: id,
        users: [user?.displayName, ...trimmedRoomMembers],
        timestamp: serverTimestamp(),
      });
      if (roomName) {
        setSelectedRoomName(roomName);
      }
      else {
      setSelectedRoomName(roomMembers);
    }
      setSelectedRoom(id);
      const eventMessage = `${user?.displayName} created a room`;
      sendEventMessage(id, eventMessage);
      closeModal();
    }
  };
  const closeModal = () => {
    setModal(false);
    setRoomMembers("");
    setRoomStatus("public");
    setRoomName("");
    setRoomType("");
  };
  const checkAndCreateRoom = () => {
    if (roomMembers.split(",").length > 1) {
      setError(true);
    } else {
      createRoom()
      setError(false);
    }
  };

  return (
    <div>
      <Modal open={modal} onClose={closeModal}>
        {roomType === "room" ? (
          <div className={cl.modal__container}>
            <div className={cl.close__icon__wrapper}>
              <IconButton onClick={closeModal}>
                <CloseIcon />
              </IconButton>
            </div>
            <div className={cl.modal__radio__wrapper}>
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
            </div>
            {roomStatus === "private" && (
              <TextField
                value={roomMembers}
                onChange={(e) => setRoomMembers(e.target.value)}
                fullWidth
                size="small"
                helperText={"Separate users with comma"}
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
        ) : roomType === "directMessage" ? (
          <div className={cl.modal__container}>
            <div className={cl.close__icon__wrapper}>
              <IconButton onClick={closeModal}>
                <CloseIcon />
              </IconButton>
            </div>
            <TextField
              value={roomMembers}
              onChange={(e) => setRoomMembers(e.target.value)}
              fullWidth
              size="small"
              error={error}
              helperText={
                error ? "You can invite only 1 user" : "Invite 1 user"
              }
              maxRows={2}
              className={cl.chat__input}
              placeholder="Invite..."
              variant="outlined"
            />
            <Button variant="outlined" onClick={checkAndCreateRoom}>
              Start a conversation
            </Button>
          </div>
        ) : (
          <div className={cl.modal__container}>
            <div className={cl.close__icon__wrapper}>
              <IconButton onClick={closeModal}>
                <CloseIcon />
              </IconButton>
            </div>
            <Button variant="outlined" onClick={() => setRoomType("room")}>
              Create room
            </Button>
            <Button variant="outlined" onClick={selectDirectMessage}>
              Direct message
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CreateRoomModal;
