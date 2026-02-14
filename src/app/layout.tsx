import type { Metadata } from "next";
import { TerminalProvider } from "@/lib/terminal";
import DosScreen from "@/components/DosScreen";
import "./globals.css";

export const metadata: Metadata = {
  title: "C:\\>",
  description: "Will's personal homepage",
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
