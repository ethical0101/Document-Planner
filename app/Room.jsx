"use client";

import React from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import Link from "next/link";
import { LiveblocksUIConfig } from "@liveblocks/react-ui";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { Loader2Icon } from "lucide-react";
import { db } from "@/config/firebaseConfig";

// Firestore limits "in" queries to 30 values.
const IN_QUERY_LIMIT = 30;

// Profiles seen in mention suggestions, so mentioned members always resolve
// to a name and avatar even if they have not opened the dashboard yet.
const knownUsers = new Map();

/**
 * Resolves Liveblocks room ids (document ids) to readable document names and
 * links, used by notifications.
 */
async function fetchRoomsInfo(roomIds) {
  return Promise.all(
    roomIds.map(async (roomId) => {
      try {
        const snap = await getDoc(doc(db, "workspaceDocuments", roomId));
        if (!snap.exists()) return { name: "Deleted document" };
        const { documentName, emoji, workspaceId } = snap.data();
        const name = documentName || "Untitled Document";
        return {
          name: emoji ? `${emoji} ${name}` : name,
          url: `/workspace/${workspaceId}/${roomId}`,
        };
      } catch {
        return { name: "Document" };
      }
    })
  );
}

/**
 * Renders Liveblocks links with Next.js navigation for in-app URLs.
 */
const AppAnchor = React.forwardRef(function AppAnchor({ href, ...props }, ref) {
  if (typeof href === "string" && href.startsWith("/")) {
    return <Link ref={ref} href={href} {...props} />;
  }
  return <a ref={ref} href={href} target="_blank" rel="noopener noreferrer" {...props} />;
});

async function fetchUsersByEmail(emails) {
  const users = new Map();
  for (let i = 0; i < emails.length; i += IN_QUERY_LIMIT) {
    const chunk = emails.slice(i, i + IN_QUERY_LIMIT);
    const snapshot = await getDocs(
      query(collection(db, "DocPlannerUsers"), where("email", "in", chunk))
    );
    snapshot.forEach((userDoc) => {
      const data = userDoc.data();
      users.set(data.email, data);
    });
  }
  return users;
}

/**
 * Provides the Liveblocks client (auth, user resolution and @mentions)
 * to everything inside a workspace.
 */
export function LiveblocksClientProvider({ children }) {
  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
      resolveUsers={async ({ userIds }) => {
        const missing = userIds.filter((id) => !knownUsers.has(id));
        if (missing.length) {
          try {
            const users = await fetchUsersByEmail(missing);
            users.forEach((user, email) => knownUsers.set(email, user));
          } catch {
            // Fall back to showing the email address.
          }
        }
        // Liveblocks expects results in the same order as the requested ids.
        return userIds.map((id) => {
          const user = knownUsers.get(id);
          return { name: user?.name || id, avatar: user?.avatar ?? undefined };
        });
      }}
      resolveRoomsInfo={({ roomIds }) => fetchRoomsInfo(roomIds)}
      resolveMentionSuggestions={async ({ text, roomId }) => {
        // Only members of the document's workspace can be mentioned.
        const params = new URLSearchParams({ roomId, text: text ?? "" });
        const response = await fetch(`/api/mention-suggestions?${params}`);
        if (!response.ok) return [];
        const { users } = await response.json();
        users.forEach((user) => knownUsers.set(user.email, user));
        return users.map((user) => user.email);
      }}
    >
      <LiveblocksUIConfig components={{ Anchor: AppAnchor }}>{children}</LiveblocksUIConfig>
    </LiveblocksProvider>
  );
}

/**
 * Joins the real-time room for a single document.
 */
export function Room({ roomId, children }) {
  if (!roomId) return null;

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense
        fallback={
          <div className="flex items-center justify-center w-full h-[60vh] text-gray-500">
            <Loader2Icon className="w-6 h-6 mr-2 animate-spin" /> Loading document…
          </div>
        }
      >
        {children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
