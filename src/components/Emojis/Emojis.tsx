import React, { FC } from "react";
import cl from "./Emojis.module.css";
import EmojiPicker from "emoji-picker-react";
import { EmojiClickData } from "emoji-picker-react";

interface EmojisProps {
  value: string;
  setValue: (name: string) => void;
  setShowEmojis: (name: boolean) => void;
}

const Emojis: FC<EmojisProps> = ({ value, setValue, setShowEmojis }) => {
  const onEmojiClick = (emojiData: EmojiClickData, event: MouseEvent) => {
    setValue(value + emojiData.emoji);
    setShowEmojis(false);
  };

  return (
    <div className={cl.emojis__wrapper}>
      <EmojiPicker autoFocusSearch={false} previewConfig={{showPreview: false}} width={300} onEmojiClick={onEmojiClick} />
    </div>
  );
};

export default Emojis;
