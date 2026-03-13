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

  return (
    <nav className="sticky top-0 z-50 bg-transparent backdrop-blur-md">

      <div className="container flex h-16 items-center justify-between">

        {/* LOGO + NAME */}
        <Link href="/" className="flex items-center gap-2">
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
        <div className="hidden items-center gap-6 md:flex">

          <Link
            href="/about"
            className="text-sm font-medium text-foreground/70 relative group transition-colors"
          >
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-[#5B5BD6] to-[#7c7ce8] group-hover:w-full transition-all duration-300"></span>
          </Link>

          <Link
            href="/contact"
            className="text-sm font-medium text-foreground/70 relative group transition-colors"
          >
            Contact
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-[#5B5BD6] to-[#7c7ce8] group-hover:w-full transition-all duration-300"></span>
          </Link>

          <Link
            href="/opportunities"
            className="text-sm font-medium text-foreground/70 relative group transition-colors"
          >
            Opportunities
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-[#5B5BD6] to-[#7c7ce8] group-hover:w-full transition-all duration-300"></span>
          </Link>

          <Link
            href="/badges"
            className="text-sm font-medium text-foreground/70 relative group transition-colors"
          >
            Badges
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-[#5B5BD6] to-[#7c7ce8] group-hover:w-full transition-all duration-300"></span>
          </Link>

          <Link href="/login?mode=signup">
            <Button size="sm" className="bg-[#5B5BD6] text-white hover:bg-[#4a4ac4] cursor-pointer transition-colors">
              Sign Up
            </Button>
          </Link>

        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-foreground"
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
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-muted-foreground relative group transition-colors"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-[#5B5BD6] to-[#7c7ce8] group-hover:w-full transition-all duration-300"></span>
            </Link>

            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-muted-foreground relative group transition-colors"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-[#5B5BD6] to-[#7c7ce8] group-hover:w-full transition-all duration-300"></span>
            </Link>

            <Link
              href="/opportunities"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-muted-foreground relative group transition-colors"
            >
              Opportunities
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-[#5B5BD6] to-[#7c7ce8] group-hover:w-full transition-all duration-300"></span>
            </Link>

            <Link
              href="/badges"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-muted-foreground relative group transition-colors"
            >
              Badges
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-[#5B5BD6] to-[#7c7ce8] group-hover:w-full transition-all duration-300"></span>
            </Link>

            <Link href="/login?mode=signup" onClick={() => setMobileOpen(false)}>
              <Button className="w-full cursor-pointer bg-[#5B5BD6] text-white transition-colors hover:bg-[#4a4ac4]">
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
