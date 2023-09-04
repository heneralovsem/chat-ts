import React, { FC, useState } from "react";
import { Modal, TextField, Button } from "@mui/material";
import cl from "./EditMessageModal.module.css";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";

interface EditMessageModalProps {
  editedValue: string | undefined;
  setEditedValue: (name: string) => void;
  editMessage: any;
  modal: boolean;
  closeModal: any;
}

const EditMessageModal: FC<EditMessageModalProps> = ({
  modal,
  closeModal,
  editedValue,
  setEditedValue,
  editMessage,
}) => {
  return (
    <Modal open={modal} onClose={closeModal}>
      <div className={cl.modal__container}>
        <div className={cl.close__icon__wrapper}>
          <IconButton onClick={closeModal}>
            <CloseIcon />
          </IconButton>
        </div>
        <div>
          {" "}
          <TextField
            multiline
            maxRows={4}
            fullWidth
            value={editedValue}
            className={cl.modal__input}
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
  );
};

export default EditMessageModal;
