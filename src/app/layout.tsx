import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/footer";
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        try {
          const storedTheme = localStorage.getItem('theme');
          if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
            document.body.style.backgroundColor = "#121212";
          } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
            document.body.style.backgroundColor = "";
          }
        } catch (e) {}
      })();
    `,
  }}
/>

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MM Font Flow",
  description: "Convert Myanmar fonts and extract text from images",
  icons: {
    icon: '/FontFlow.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
