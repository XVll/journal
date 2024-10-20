import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import { ThemeProvider } from "@/providers/theme-provider";

export const metadata: Metadata = {
    title: "Journal",
    description: "Trade Journals",
};

export default function RootLayout({children,}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
      <html lang="en">
        <body className={`antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="fx-theme">{children}</ThemeProvider>
        </body>
      </html>
    );
}
