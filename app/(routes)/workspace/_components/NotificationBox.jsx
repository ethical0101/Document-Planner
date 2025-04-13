import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  useInboxNotifications,
  useUpdateRoomNotificationSettings,
} from "@liveblocks/react/suspense";
import {
  InboxNotification,
  InboxNotificationList,
  Thread,
} from "@liveblocks/react-ui";
import React, { useEffect } from "react";
import { useUnreadInboxNotificationsCount } from "@liveblocks/react";

function NotificationBox({ children }) {
  const { inboxNotifications } = useInboxNotifications();
  const updateRoomNotificationSettings = useUpdateRoomNotificationSettings();
  const { count, error, isLoading } = useUnreadInboxNotificationsCount();

  useEffect(() => {
    updateRoomNotificationSettings({ threads: "all" });
    console.log("Messeges Count-->", count);
  }, [count]);
  return (
    <div>
      <Popover>
        <PopoverTrigger>
          <div className="flex gap-1"> 
            {children}
            <span className="p-1 px-2 -ml-3 text-white rounded-full bg-primary text-[8px]">{count}</span>
          </div>
        </PopoverTrigger>
        <PopoverContent className={"w-[500px]"}>
          <InboxNotificationList>
            {inboxNotifications.map((inboxNotification) => (
              <InboxNotification
                key={inboxNotification.id}
                inboxNotification={inboxNotification}
              />
            ))}
          </InboxNotificationList>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default NotificationBox;
