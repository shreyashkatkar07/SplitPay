
// Import hooks for Convex actions, Clerk user, and React effect
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";


// ProfileSync syncs the authenticated Clerk user profile to Convex backend
export default function ProfileSync() {
  // Get the Convex action for syncing user
  const syncClerkUser = useAction(api.users.syncClerkUser);
  // Get Clerk user info and sign-in state
  const { user, isSignedIn } = useUser();

  // When user is signed in, sync their profile to Convex
  useEffect(() => {
    if (isSignedIn && user?.id) {
      console.log("Syncing Clerk user to Convex:", user.id);
      syncClerkUser({ clerkUserId: user.id });
    }
  }, [isSignedIn, user, syncClerkUser]);

  // No UI needed; this runs in the background
  return null;
}