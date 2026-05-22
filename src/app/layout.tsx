import React from "react";
import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Nexus Research — Heuristics Intake & Workspace",
  description: "Translate raw project requirements into objective, industry-standard research interview guides.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${dmSans.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased h-full bg-[#fbfbf9] text-neutral-800">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
