import { Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import "@liveblocks/react-ui/styles.css";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: "Document Planner",
    template: "%s | Document Planner",
  },
  description:
    "A real-time collaborative document workspace with rich editing, comments, mentions and notifications.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8230ff",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={outfit.className}>
          <Toaster />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
