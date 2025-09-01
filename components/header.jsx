
// Mark this file as a Client Component (Next.js)
"use client";


// Import hooks and components for user state, auth, navigation, and UI
import { useStoreUser } from "@/hooks/use-store-user";
import {
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import BarLoader from "react-spinners/BarLoader";
import { Button } from "./ui/button";
import { LayoutDashboard } from "lucide-react";


// Header displays the top navigation bar with logo, links, and auth actions
const Header = () => {
  // Get loading state for user data
  const { isLoading } = useStoreUser();
  // Get current path for conditional rendering
  const path = usePathname();

  return (
    <header className="fixed top-0 w-full border-b bg-white/95 backdrop-blur z-50 supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and home link */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={"/logos/logo.png"}
            alt="SplitPay Logo"
            width={200}
            height={60}
            className="h-11 w-auto object-contain"
          />
        </Link>

        {/* Show feature links only on home page and medium+ screens */}
        {path === "/" && (
          <div className="hidden md:flex items-center gap-6">
            <Link
              href={"#features"}
              className="text-sm font-medium hover:text-green-600 transition"
            >
              Features
            </Link>
            <Link
              href={"#how-it-works"}
              className="text-sm font-medium hover:text-green-600 transition"
            >
              How It Works
            </Link>
            <Link
              href={"#testimonials"}
              className="text-sm font-medium hover:text-green-600 transition"
            >
              Testimonials
            </Link>
          </div>
        )}

        {/* Authenticated and unauthenticated user actions */}
        <div className="flex items-center gap-4">
          {/* If user is authenticated, show dashboard and user menu */}
          <Authenticated>
            <Link href="/dashboard">
              <Button
                variant={"outline"}
                className="hidden md:inline-flex items-center gap-2 hover:text-green-600 hover:border-green-600 transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>

              <Button variant={"ghost"} className="md:hidden w-10 h-10 p-0">
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            </Link>
            {/* User profile menu */}
            <UserButton />
          </Authenticated>

          {/* If user is not authenticated, show sign in/up buttons */}
          <Unauthenticated>
            <SignInButton>
              <Button variant={"ghost"}>Sign In</Button>
            </SignInButton>

            <SignUpButton>
              <Button className="bg-green-600 hover:bg-green-700 border-none">
                Get Started
              </Button>
            </SignUpButton>
          </Unauthenticated>
        </div>
      </nav>

      {/* Show loading bar while user data is loading */}
      {isLoading && <BarLoader width={"100%"} color="#36d7b7" />}
    </header>
  );
};


// Export the Header component for use in other parts of the app
export default Header;
