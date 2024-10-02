import EmojiPicker from "emoji-picker-react";
import { set } from "mongoose";
import React from "react";

const EmojiPickerComponents = ({ children, showPicker,setEmoji }) => {
  return (
    <div>
      <div>{children}</div>
      {showPicker && (
        <div className="absolute z-10">
          <EmojiPicker onEmojiClick={(e)=>setEmoji(e.emoji)}/>
        </div>
      )}
    </div>
  );
};

export default EmojiPickerComponents;
