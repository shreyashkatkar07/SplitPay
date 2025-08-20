import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function ProfileSync() {
  const syncClerkUser = useAction(api.users.syncClerkUser);
  const { user, isSignedIn } = useUser();

  useEffect(() => {
  if (isSignedIn && user?.id) {
    console.log("Syncing Clerk user to Convex:", user.id);
    syncClerkUser({ clerkUserId: user.id });
  }
}, [isSignedIn, user, syncClerkUser]);

  return null; // No UI needed, runs in background
}