import React, { FC } from "react";
import cl from './MainLoader.module.css'

const MainLoader: FC = () => {
    return (
        <div className={cl.lds__ring}><div></div><div></div><div></div><div></div></div>
    )
}

export default MainLoader;