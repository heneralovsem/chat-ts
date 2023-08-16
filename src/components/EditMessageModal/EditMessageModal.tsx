import React, { FC, useState } from "react";
import { Modal, TextField, Button } from "@mui/material";
import cl from './EditMessageModal.module.css'

interface EditMessageModalProps {
    editedValue: string | undefined,
    setEditedValue: (name: string) => void,
    editMessage: any,
    modal: boolean,
    closeModal: any;


}

const EditMessageModal: FC<EditMessageModalProps> = ({modal, closeModal, editedValue, setEditedValue, editMessage}) => {

    return (
            <Modal open={modal} onClose={closeModal}>
                  <div className={cl.comment__modal}>
                    <div>
                      {" "}
                      <TextField
                        multiline
                        maxRows={4}
                        value={editedValue}
                        className={cl.modal__text}
                        onChange={(event) => setEditedValue(event.target.value)}
                      ></TextField>{" "}
                    </div>
                    <div>
                      <Button
                        className={cl.modal__btn}
                        variant="outlined"
                        onClick={editMessage}
                      >
                        {" "}
                        Save
                      </Button>
                    </div>
                  </div>
                </Modal>
    )
}

export default EditMessageModal