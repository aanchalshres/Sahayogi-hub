"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";


const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isDashboard =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/org");

  if (isDashboard) return null;

  return (
    <nav className="sticky top-0 z-50 bg-transparent backdrop-blur-md">

      {/* added px-4 to shift content inward */}
      <div className="container flex h-16 items-center justify-between px-4">

        {/* LOGO (shift slightly right using ml-2) */}
        <Link href="/" className="flex items-center gap-2 ml-2">
          <Image
            src="/logo3.png"
            alt="Sahayogi Logo"
            width={100}
            height={100}
            className="rounded-lg"
            priority
          />
        </Link>

        {/* DESKTOP MENU */}
        {/* added mr-2 to shift left slightly */}
        <div className="hidden items-center gap-4 md:flex mr-2">

          {/* <Link
            href="/volunteer"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Volunteer
          </Link>
          <Link
            href="/org"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Organization
          </Link> */}

          <Link
            href="/badges"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Badges
          </Link>

          <Link
            href="/about"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            About Us
          </Link>

          <div className="flex items-center gap-2">

            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>

            <Link href="/signup">
              <Button
                size="sm"
                className="bg-[#5B5BD6] hover:bg-[#4a4ac4] text-white ractangle-full px-3"
              >
                Sign Up
              </Button>
            </Link>

          </div>

        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-foreground mr-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen
            ? <X className="h-6 w-6" />
            : <Menu className="h-6 w-6" />}
        </button>

      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="border-t bg-card p-4 md:hidden">

          <div className="flex flex-col gap-3">

            

            <Link
              href="/badges"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-muted-foreground"
            >
              Badges
            </Link>

            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full">
                Log In
              </Button>
            </Link>

            <Link href="/signup" onClick={() => setMobileOpen(false)}>
              <Button className="bg-[#5B5BD6] hover:bg-[#4a4ac4] text-white w-full rounded-full">
                Sign Up
              </Button>
            </Link>

          </div>

        </div>
      )}

    </nav>
  );
};

export default Navbar;