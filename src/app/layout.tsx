import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
    title: "Journal",
    description: "Trade Journals",
};

export default function RootLayout({children,}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`antialiased`}>
                <QueryProvider>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="fx-theme">
                        <main>{children}</main>
                        <Sonner />
                        <Toaster />
                    </ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
