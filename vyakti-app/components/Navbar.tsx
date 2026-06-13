"use client";

import Link from "next/link";
import { Menu, LogOut, Settings, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export function Logo({ size = 18 }: { size?: number }) {
  return (
    <span style={{ fontSize: size, fontFamily: "Inter, system-ui, sans-serif" }} className="font-medium tracking-tight text-[#444441]">
      vya<span className="text-[#1D9E75]">k</span>ti
    </span>
  );
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const links = ["How it works", "For families", "Integrations"];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#e5e5e5] bg-white">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 md:px-16">
        <Link href="/">
          <Logo />
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l} href={`/#${l.toLowerCase().replace(/ /g, "-")}`} className="text-[13px] text-[#444441] hover:text-[#1D9E75] transition-colors">
              {l}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-4">
          
          {/* Auth State */}
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
          ) : session?.user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-8 h-8 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/20 flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:ring-offset-2"
              >
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#0F6E56] text-[13px] font-medium">
                    {session.user.name?.[0]?.toUpperCase() || <User size={14} />}
                  </span>
                )}
              </button>
              
              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#e5e5e5] rounded-[10px] shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-[#e5e5e5]">
                    <p className="text-[13px] font-medium text-[#1A1A1A] truncate">{session.user.name || "User"}</p>
                    <p className="text-[11px] text-[#888780] truncate">{session.user.email || session.user.id}</p>
                  </div>
                  <Link 
                    href="/preferences" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-[13px] text-[#444441] hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <Settings size={14} />
                    Preferences
                  </Link>
                  <button 
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="inline-flex items-center rounded-[10px] px-[16px] py-2 text-[13px] text-[#444441] hover:bg-gray-50 transition"
            >
              Sign in
            </Link>
          )}

          <Link
            href="/app"
            className="inline-flex items-center rounded-[10px] bg-[#1D9E75] px-[18px] py-2 text-[13px] text-white transition hover:bg-[#178a66]"
          >
            Try the demo
          </Link>
        </div>
        {/* Mobile menu — simplified */}
        <a href="#hero" className="md:hidden">
          <Menu size={20} className="text-[#444441]" />
        </a>
      </div>
    </nav>
  );
}
