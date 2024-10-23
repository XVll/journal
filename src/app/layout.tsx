import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import MotionProvider from "@/providers/motion-provider";
import { karla } from "@/components/fonts";

export const metadata: Metadata = {
    title: "Journal",
    description: "Trade Journals",
};

export default function RootLayout({children,}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={karla.className}>
                <QueryProvider>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="fx-theme">
                        <MotionProvider>
                            <main>{children}</main>
                        </MotionProvider>
                        <Sonner />
                        <Toaster />
                    </ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
