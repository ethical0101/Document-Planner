"use client";

import { useEffect } from "react";
import { useUpdateRoomSubscriptionSettings } from "@liveblocks/react/suspense";

/**
 * Subscribes the current user to every comment thread in the room so that
 * new comments show up in their notifications inbox.
 */
function RoomSubscriptions() {
  const updateSettings = useUpdateRoomSubscriptionSettings();

  useEffect(() => {
    updateSettings({ threads: "all" });
  }, [updateSettings]);

  return null;
}

export default RoomSubscriptions;
