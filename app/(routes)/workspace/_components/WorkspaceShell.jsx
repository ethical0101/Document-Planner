"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LiveblocksClientProvider } from "@/app/Room";
import SideNav from "./SideNav";

const SidebarContext = createContext({ open: false, setOpen: () => {} });

export function useSidebar() {
  return useContext(SidebarContext);
}

/**
 * Workspace frame: a fixed sidebar on desktop and a slide-in drawer on
 * smaller screens, with the active page rendered alongside it.
 */
function WorkspaceShell({ workspaceId, children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Allow closing the drawer with the Escape key.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <LiveblocksClientProvider>
      <SidebarContext.Provider value={{ open, setOpen }}>
        <div className="min-h-screen bg-white">
          {/* Mobile backdrop */}
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden ${
              open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />

          <aside
            className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-200 md:translate-x-0 ${
              open ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <SideNav workspaceId={workspaceId} onClose={() => setOpen(false)} />
          </aside>

          <main className="min-w-0 md:pl-72">{children}</main>
        </div>
      </SidebarContext.Provider>
    </LiveblocksClientProvider>
  );
}

export default WorkspaceShell;
