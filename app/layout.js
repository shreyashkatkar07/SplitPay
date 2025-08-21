import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], });

export const metadata = {
  title: "SplitPay - Split Smarter",
  description: "Create groups for trips or roommates, split expenses in multiple ways, track spending analytics, get payment reminders, and enjoy real-time updates. Smart settlements minimize payments—SplitPay makes shared expenses simple and organized.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="\logos\logo-s.png" />
      </head>
      <body
        className={`${inter.className}`}
      >
        <ClerkProvider>
          <ConvexClientProvider>
            <Header />

            <main className="min-h-screen mx-7">
              {children}
              <Toaster richColors />
            </main>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
