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
    console.log(emojiData)
    setValue(value + emojiData.emoji);
    setShowEmojis(false);
  };

  return (
    <div className={cl.emojis__wrapper}>
      <EmojiPicker autoFocusSearch={false} previewConfig={{showPreview: false}} width={300} onEmojiClick={onEmojiClick} customEmojis={[{
        names: ['AYAYA'],
        imgUrl:
          'https://cdn3.emoji.gg/emojis/AYAYA.png',
        id: 'AYAYA'
      },
      {
        names: ['Hat'],
        imgUrl:
          'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/hat.png',
        id: 'hat'
      },
      {
        names: ['Shroom', 'mushroom'],
        imgUrl:
          'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/shroom.png',
        id: 'shroom'
      },]} />
    </div>
  );
};

export default Emojis;
