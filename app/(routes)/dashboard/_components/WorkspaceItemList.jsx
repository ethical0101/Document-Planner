"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { coverImageSrc } from "@/lib/workspace";

function WorkspaceItemList({ workspaceList, view = "grid" }) {
  if (view === "list") {
    return (
      <ul className="mt-6 overflow-hidden border divide-y rounded-xl">
        {workspaceList.map((workspace) => (
          <li key={workspace.id}>
            <Link
              href={`/workspace/${workspace.id}`}
              className="flex items-center gap-4 p-3 transition-colors hover:bg-gray-50"
            >
              <Image
                src={coverImageSrc(workspace.coverImage)}
                width={96}
                height={56}
                alt=""
                className="object-cover w-16 h-10 rounded-md shrink-0"
              />
              <span className="truncate">
                {workspace.emoji} {workspace.workspaceName}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {workspaceList.map((workspace) => (
        <Link
          key={workspace.id}
          href={`/workspace/${workspace.id}`}
          className="block overflow-hidden transition-all border shadow-lg rounded-xl hover:scale-[1.03] hover:shadow-xl"
        >
          <Image
            src={coverImageSrc(workspace.coverImage)}
            width={400}
            height={200}
            alt="Workspace cover"
            className="w-full h-[150px] object-cover"
          />
          <div className="p-4">
            <h2 className="flex gap-2 truncate">
              {workspace.emoji} {workspace.workspaceName}
            </h2>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default WorkspaceItemList;
