import type { Metadata } from "next";
import {cookies} from 'next/headers';
import {UI,say} from '@/lib/behavior-copy';
import "./globals.css";
import "./command-theme.css";

export async function generateMetadata():Promise<Metadata>{
 const language=(await cookies()).get('ocean_language')?.value==='en'?'en':'zh-Hant';
 return {
  title: say(UI.title,language),
  description: say(UI.intro,language),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
 };}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language=(await cookies()).get('ocean_language')?.value==='en'?'en':'zh-Hant';
  return (
    <html lang={language}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
