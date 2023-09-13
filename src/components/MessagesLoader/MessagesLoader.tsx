import React, { FC } from "react";
import cl from './MessagesLoader.module.css'

const MessagesLoader: FC = () => {
    return (
        <div className={cl.lds__ring}><div></div><div></div><div></div><div></div></div>
    )
}

export default MessagesLoader;