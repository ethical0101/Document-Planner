"use client";

import React from "react";
import {
  useInboxNotifications,
  useUnreadInboxNotificationsCount,
} from "@liveblocks/react/suspense";
import { InboxNotification, InboxNotificationList } from "@liveblocks/react-ui";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function NotificationBox({ children }) {
  const { inboxNotifications } = useInboxNotifications();
  const { count } = useUnreadInboxNotificationsCount();

  return (
    <Popover>
      <PopoverTrigger className="relative p-1 rounded-md hover:bg-gray-200" aria-label="Notifications">
        {children}
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[10px] leading-4 text-center bg-primary text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[calc(100vw-2rem)] sm:w-[420px] max-h-[70vh] overflow-y-auto p-0"
      >
        {inboxNotifications.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">You&apos;re all caught up.</p>
        ) : (
          <InboxNotificationList>
            {inboxNotifications.map((inboxNotification) => (
              <InboxNotification key={inboxNotification.id} inboxNotification={inboxNotification} />
            ))}
          </InboxNotificationList>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBox;
