import React, { FC, useState } from "react";
import { Modal, TextField, Button } from "@mui/material";
import cl from './CreateRoomModal.module.css'

interface createRoomModalProps {
roomStatus: string,
setRoomStatus: (name: string) => void,
roomMembers: string,
setRoomMembers: (name: string) => void,
roomName: string,
setRoomName: (name: string) => void,
createRoom: any,
modal: boolean,
closeModal: any;


}
const CreateRoomModal: FC<createRoomModalProps> = ({roomStatus, setRoomStatus, roomMembers, setRoomMembers, roomName, setRoomName, createRoom, modal, closeModal}) => {

  const [roomType, setRoomType] = useState<string>('')
  const selectDirectMessage = () => {
    setRoomType('directMessage')
    setRoomStatus('dm')
    setRoomName('DMtest2')
  }
  const onCloseModal = () => {
    closeModal()
    setRoomMembers('')
    setRoomStatus('public')
    setRoomType('')
    setRoomName('')
  }


    return (
        <div>
            
            <Modal open={modal} onClose={onCloseModal}>
              {roomType === 'room' ? <div className={cl.modal__container}>
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
          </div> : roomType === 'directMessage' ? <div className={cl.modal__container}>
            
              <TextField
                value={roomMembers}
                onChange={(e) => setRoomMembers(e.target.value)}
                fullWidth
                maxRows={2}
                className={cl.chat__input}
                placeholder="Invite..."
                variant="outlined"
              />
            <Button variant="outlined" onClick={createRoom}>
              Start a conversation
            </Button>
          </div> : <div className={cl.modal__container}>
            <Button onClick={() => setRoomType('room')}>Create room</Button>
            <Button onClick={selectDirectMessage}>Direct message</Button>
          </div>}
            
            </Modal>
        </div>
    )
}

export default CreateRoomModal;