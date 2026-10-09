"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { Loader2Icon } from "lucide-react";
import { auth } from "@/config/firebaseConfig";
import { Button } from "@/components/ui/button";

/**
 * Signs the Clerk user into Firebase with a custom token before rendering
 * pages that read Firestore. The token is refreshed whenever the user or the
 * active organization changes, so new organization memberships are picked up.
 */
function FirebaseAuthGate({ children }) {
  const { isLoaded, isSignedIn, userId, orgId } = useAuth();
  const sessionKey = isSignedIn ? `${userId}:${orgId ?? "personal"}` : null;
  const [readyKey, setReadyKey] = useState(null);
  const [error, setError] = useState(false);

  const connect = useCallback(async (key) => {
    setError(false);
    try {
      const response = await fetch("/api/firebase-token", { method: "POST" });
      if (!response.ok) throw new Error(`Token request failed (${response.status})`);
      const { token } = await response.json();
      await signInWithCustomToken(auth, token);
      setReadyKey(key);
    } catch (e) {
      console.error(e);
      setError(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!sessionKey) {
      signOut(auth).catch(() => {});
      setReadyKey(null);
      return;
    }
    connect(sessionKey);
  }, [isLoaded, sessionKey, connect]);

  if (readyKey && readyKey === sessionKey) return children;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
      {error ? (
        <>
          <p className="text-gray-600">We couldn&apos;t connect to the database. Please try again.</p>
          <Button onClick={() => connect(sessionKey)}>Retry</Button>
        </>
      ) : (
        <Loader2Icon className="w-6 h-6 text-gray-400 animate-spin" aria-label="Loading" />
      )}
    </div>
  );
}

export default FirebaseAuthGate;
