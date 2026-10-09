"use client";

import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";

function EmojiPickerComponent({ children, setEmojiIcon }) {
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const containerRef = useRef(null);

  // Close the picker on outside click or Escape.
  useEffect(() => {
    if (!openEmojiPicker) return;
    const onPointerDown = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpenEmojiPicker(false);
    };
    const onKeyDown = (e) => e.key === "Escape" && setOpenEmojiPicker(false);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openEmojiPicker]);

  return (
    <div ref={containerRef} className="relative">
      <div onClick={() => setOpenEmojiPicker((open) => !open)}>{children}</div>
      {openEmojiPicker && (
        <div className="absolute left-0 z-40 mt-2">
          <EmojiPicker
            emojiStyle="facebook"
            width="min(350px, calc(100vw - 2rem))"
            height={400}
            onEmojiClick={(e) => {
              setEmojiIcon(e.emoji);
              setOpenEmojiPicker(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default EmojiPickerComponent;
