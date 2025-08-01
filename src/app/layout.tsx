import type React from "react";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

const mono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://medimemo.com"),
  title: "MediMemo - Medical Report Interpreter",
  description:
    "Upload your medical reports and get clear, easy-to-understand explanations in plain English. Powered by Together AI and Qwen 2.5 72B",
  openGraph: {
    images: "/og.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>{/* rest of your scripts go under */}</head>
      <body className={`${mono.className} min-h-screen flex flex-col`}>
        <main className="flex-1 flex flex-col">{children}</main>
        <Toaster richColors />
      </body>
    </html>
  );
}
