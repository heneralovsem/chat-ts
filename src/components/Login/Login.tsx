import React, { FC, useContext } from "react";
import cl from "./Login.module.css";
import { Button } from "@mui/material";
import { IUser } from "../../types/types";
import { Context } from "../..";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  setDoc,
  doc,
  serverTimestamp,
  query,
  collection,
  orderBy,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";

const Login: FC = () => {
  const { auth, firestore } = useContext(Context);
  const [userList] = useCollectionData(
    query(collection(firestore, `rooms`), orderBy("createdAt"))
  );

  const login = async () => {
    const provider = new GoogleAuthProvider();
    const { user }: any = await signInWithPopup(auth, provider);

    if (!userList?.includes(user.uid)) {
      await setDoc(doc(firestore, "users", `${user.displayName}`), {
        name: user.displayName,
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
    }

    console.log(user.uid);

    console.log(user);
  };

  return (
    <div className={cl.login__wrapper}>
      <div className={cl.login__form}>
        <Button onClick={login} variant="outlined">
          Sign in with Google
        </Button>
      </div>
    </div>
  );
};

export default Login;
