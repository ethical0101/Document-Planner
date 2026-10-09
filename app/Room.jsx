"use client";

import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Loader2Icon } from "lucide-react";
import { db } from "@/config/firebaseConfig";

// Firestore limits "in" queries to 30 values.
const IN_QUERY_LIMIT = 30;

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
        const users = await fetchUsersByEmail(userIds);
        // Liveblocks expects results in the same order as the requested ids.
        return userIds.map((id) => {
          const user = users.get(id);
          return user ? { name: user.name || user.email, avatar: user.avatar } : undefined;
        });
      }}
      resolveMentionSuggestions={async ({ text }) => {
        const snapshot = await getDocs(
          query(collection(db, "DocPlannerUsers"), where("email", "!=", null))
        );
        const search = text?.toLowerCase() ?? "";
        const matches = [];
        snapshot.forEach((userDoc) => {
          const { name, email } = userDoc.data();
          if (
            !search ||
            name?.toLowerCase().includes(search) ||
            email?.toLowerCase().includes(search)
          ) {
            matches.push(email);
          }
        });
        return matches;
      }}
    >
      {children}
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
