import EmojiPicker from "emoji-picker-react";
import React from "react";

const EmojiPickerComponents = ({ children, showPicker }) => {
  return (
    <div>
      <div>{children}</div>
      {showPicker && (
        <div className="absolute z-10">
          <EmojiPicker />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerComponents;
