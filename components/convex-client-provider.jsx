
// Mark this file as a Client Component (Next.js)
"use client";


// Import Clerk authentication hook
import { useAuth } from "@clerk/nextjs";
// Import Convex client and provider for React
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";


// Initialize Convex client with the backend URL from environment variables
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);


// This provider wraps your app, giving all children access to Convex (backend) and Clerk (auth)
export function ConvexClientProvider({ children }) {
  return (
    <ConvexProviderWithClerk 
      client={convex} // Pass the Convex client instance
      useAuth={useAuth} // Pass the Clerk authentication hook
    >
      {children}
    </ConvexProviderWithClerk>
  );
}