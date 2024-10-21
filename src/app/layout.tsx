import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";

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
                <QueryProvider>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="fx-theme">
                        {children}
                    </ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
