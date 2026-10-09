"use client";

import React, { useState } from "react";
import {
  useInboxNotifications,
  useMarkAllInboxNotificationsAsRead,
  useUnreadInboxNotificationsCount,
} from "@liveblocks/react/suspense";
import { InboxNotification, InboxNotificationList } from "@liveblocks/react-ui";
import { Bell, CheckCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function NotificationBox() {
  const [open, setOpen] = useState(false);
  const { inboxNotifications } = useInboxNotifications();
  const { count } = useUnreadInboxNotificationsCount();
  const markAllAsRead = useMarkAllInboxNotificationsAsRead();

  const onOpenChange = (next) => {
    setOpen(next);
    // Opening the inbox counts as seeing the notifications.
    if (next && count > 0) markAllAsRead();
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        className="relative p-1 rounded-md hover:bg-gray-200"
        aria-label={count > 0 ? `Notifications (${count} unread)` : "Notifications"}
      >
        <Bell className="w-5 h-5 text-gray-500" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[10px] leading-4 text-center bg-primary text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        className="flex flex-col w-[calc(100vw-2rem)] sm:w-[420px] max-h-[70vh] p-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold">Notifications</h2>
          {inboxNotifications.length > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary"
            >
              <CheckCheck className="w-4 h-4" /> Mark all as read
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto" onClick={(e) => {
          // Close the inbox when a notification link is followed.
          if (e.target.closest?.("a[href]")) setOpen(false);
        }}>
          {inboxNotifications.length === 0 ? (
            <p className="p-6 text-sm text-center text-gray-500">You&apos;re all caught up.</p>
          ) : (
            <InboxNotificationList>
              {inboxNotifications.map((inboxNotification) => (
                <InboxNotification key={inboxNotification.id} inboxNotification={inboxNotification} />
              ))}
            </InboxNotificationList>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBox;
