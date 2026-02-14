import type { Metadata } from "next";
import { TerminalProvider } from "@/lib/terminal";
import DosScreen from "@/components/DosScreen";
import "./globals.css";

export const metadata: Metadata = {
  title: "will://",
  description: "Will's personal homepage",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.jpg",
  },
  manifest: "/manifest.json",
  openGraph: {
    images: [{ url: "/og-image.jpg" }],
  },
  twitter: {
    card: "summary",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TerminalProvider>
          <DosScreen>{children}</DosScreen>
        </TerminalProvider>
      </body>
    </html>
  );
}
