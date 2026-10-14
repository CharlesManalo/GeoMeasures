import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./experience.css";
import "./learning.css";
import "./narration.css";
import "./geometry.css";
import {ExperienceShell} from "@/components/experience/ExperienceShell";

export const metadata: Metadata = {
  title: "Geo Measure | Grade 11 Geometry & Measurement",
  description: "Grade 11 Geometry and Measurement lessons, practice, games, and glossary.",
  appleWebApp: {capable:true,title:"Geo Measure",statusBarStyle:"default"},
  icons: {icon:"/icon.svg",apple:"/app-icons/apple-touch-icon.png"},
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit:"cover", themeColor: "#fffaf4" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body><ExperienceShell>{children}</ExperienceShell></body>
    </html>
  );
}
