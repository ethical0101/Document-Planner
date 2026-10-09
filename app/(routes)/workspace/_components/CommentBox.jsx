"use client";

import React from "react";
import { useThreads } from "@liveblocks/react/suspense";
import { Composer, Thread } from "@liveblocks/react-ui";

function CommentBox() {
  const { threads } = useThreads();

  return (
    <div className="w-[calc(100vw-2rem)] sm:w-[340px] max-h-[60vh] flex flex-col bg-white border rounded-lg shadow-xl overflow-hidden">
      <div className="px-4 py-2 text-sm font-medium border-b">Comments</div>
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 && (
          <p className="p-4 text-sm text-gray-500">No comments yet. Start the conversation.</p>
        )}
        {threads.map((thread) => (
          <Thread key={thread.id} thread={thread} />
        ))}
      </div>
      <div className="border-t">
        <Composer />
      </div>
    </div>
  );
}

export default CommentBox;
