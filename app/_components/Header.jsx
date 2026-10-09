"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
];

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20 px-4 sm:px-8">
      <nav className="flex items-center justify-between py-4">
        <Logo />

        <div className="items-center hidden gap-8 md:flex">
          <ul className="flex gap-6 text-sm font-medium text-gray-600">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition hover:text-primary">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard"
            className="px-5 py-2 text-sm font-semibold text-white transition rounded-full bg-primary hover:opacity-90"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="p-2 -mr-2 rounded-md md:hidden hover:bg-gray-100"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {open && (
        <div className="absolute left-4 right-4 p-6 bg-white border shadow-2xl top-full rounded-2xl md:hidden">
          <ul className="flex flex-col gap-4 font-medium text-gray-700">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)} className="block hover:text-primary">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard"
            className="block px-5 py-2 mt-6 font-semibold text-center text-white rounded-full bg-primary"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;
