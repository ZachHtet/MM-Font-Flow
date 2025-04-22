"use client";

import { ThemeToggle } from "./ui/theme-toggle";
import Link from "next/link";

export function Header() {
  return (
    <header className="w-full bg-background border-b border-border py-8">
      <div className="app-container flex justify-between items-center">
        <Link href="/" className="font-bold text-xl flex items-center gap-3">
          <img 
            src="/favicon.svg" 
            alt="MM Font Flow Logo" 
            className="w-6 h-6 dark:fill-white light:fill-black"
          />
          MM FONT FLOW
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}