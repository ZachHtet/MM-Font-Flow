"use client";

import { ThemeToggle } from "./ui/theme-toggle";
import Image from 'next/image';
import Link from "next/link";

export function Header() {
  return (
    <header className="w-full bg-background border-b border-border py-8">
      <div className="app-container flex justify-between items-center">
        <Link href="/" className="font-bold text-lg sm:text-xl flex items-center gap-3">
          <Image
            src="/favicon.svg" 
            alt="MM Font Flow Logo" 
            width={48}
            height={48}
            className="w-5 h-5 sm:w-6 sm:h-6 dark:fill-white light:fill-black"
          />
          <span className="text-base sm:text-lg md:text-xl">MM FONT FLOW</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}