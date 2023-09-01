import React, { FC, useContext, useState } from "react";
import { IRoom } from "../../types/types";
import { Avatar, Button } from "@mui/material";
import { Context, RoomContext } from "../..";
import { collection, query, orderBy } from "firebase/firestore";
import { IMessage } from "../../types/types";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import ImageIcon from "@mui/icons-material/Image";
import cl from "./RoomItem.module.css";
import dayjs from "dayjs";

interface RoomItemProps {
  room: IRoom;
  isScrolling: boolean;
  setIsScrolling: any;
  setSelectedRoomName: (name: string) => void;
  setSelectedRoomStatus: (name: string | undefined) => void;
  setSelectedRoomUsers: (name: Array<string>) => void;
  setContentVisibility: ( name: boolean) => void
}

const RoomItem: FC<RoomItemProps> = ({
  room,
  isScrolling,
  setIsScrolling,
  setSelectedRoomName,
  setSelectedRoomUsers,
  setSelectedRoomStatus,
  setContentVisibility
}) => {
  const { auth, firestore } = useContext(Context);
  const [user] = useAuthState(auth);
  const [messages, loading] = useCollectionData<IMessage>(
    query(
      collection(firestore, `rooms/${room.docId}/messages`),
      orderBy("createdAt")
    )
  );
  const lastMessage = messages?.[messages?.length - 1];
  const { selectedRoom, setSelectedRoom } = useContext(RoomContext);
  const selectRoom = () => {
    setSelectedRoom(room.docId);
    setSelectedRoomStatus(room.status);
    setContentVisibility(true)
    setIsScrolling(false);
    if (room.users) {
      setSelectedRoomUsers(room.users);
    }

    if (room.name) {
      setSelectedRoomName(room.name);
    } else if (room.users && room.users[0] === user?.displayName) {
      setSelectedRoomName(room.users[1]);
    } else if (room.users) {
      setSelectedRoomName(room.users[0]);
    }
  };
  const lastMessageDate =
    lastMessage?.createdAt && lastMessage.createdAt.toDate();
  const currentDate = new Date();
  const dayDifference =
    lastMessageDate &&
    Math.floor(
      (currentDate.getTime() - lastMessageDate.getTime()) / (1000 * 3600 * 24)
    );
  const hoursAndMins = dayjs(lastMessageDate).format("HH:mm");
  const fullDate = dayjs(lastMessageDate).format("DD.MM.YY HH:mm");

  return (
    <div className={cl.room__wrapper} onClick={selectRoom}>
      <div className={cl.room__name__flex}>
      {room.status === "dm" && room.users ? (
        <div>
          {room.users[0] === user?.displayName ? (
            <h2 className={cl.room__name}>{room.users[1]}</h2>
          ) : (
            <h2 className={cl.room__name}>{room.users[0]}</h2>
          )}{" "}
        </div>
      ) : (
        <h2 className={cl.room__name}>{room.name}</h2>
      )}
      <span className={cl.room__date}> {dayDifference > 0 ? fullDate : hoursAndMins}</span>{" "}
      </div>
      {lastMessage && (
        <div className={cl.room__message}>
          {" "}
          <div className={cl.room__avatar__row}>
            {" "}
            <Avatar src={lastMessage?.photoURL} />
            <span>{lastMessage?.displayName}</span>{" "}
          </div>{" "}
          <div className={cl.room__message__text__wrapper}>
          {lastMessage.imageURL && <ImageIcon className={cl.img__icon}/>}
            <p className={cl.room__message__text}>
               {lastMessage?.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomItem;
