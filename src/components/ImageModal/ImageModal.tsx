import React, { FC, useState } from "react";
import { Modal, TextField, Button } from "@mui/material";
import cl from "./ImageModal.module.css";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";

interface ImageModalProps {
  imageURL: string | null | undefined;
  imageModal: boolean;
  setImageModal: (name: boolean) => void;
}

const ImageModal: FC<ImageModalProps> = ({
  imageModal,
  setImageModal,
  imageURL,
}) => {
    const closeModal = () => {
        setImageModal(false)
    }
  return (
    <Modal open={imageModal} onClose={closeModal}>
      <div className={cl.modal__container}>
      <div className={cl.close__icon__wrapper}>
          <IconButton onClick={closeModal}>
            <CloseIcon />
          </IconButton>
        </div>
        {imageURL && <img className={cl.modal__img} src={imageURL} alt="modalImg" />}
      </div>
    </Modal>
  );
};

export default ImageModal;