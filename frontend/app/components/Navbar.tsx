"use client";

import Link from "next/link";
import Image from "next/image"; // ✅ REQUIRED IMPORT
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

      <div className="container flex h-16 items-center justify-between">

        {/* ✅ LOGO + NAME */}
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


        {/* ✅ DESKTOP MENU */}
        <div className="hidden items-center gap-6 md:flex">

          <Link
            href="/opportunities"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Opportunities
          </Link>

          <Link
            href="/badges"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Badges
          </Link>

          <Link href="/login">
            <Button variant="ghost" size="sm" className="cursor-pointer transition-colors">
              Log In
            </Button>
          </Link>

          <Link href="/login?mode=signup">
            <Button size="sm" className="cursor-pointer transition-colors">
              Sign Up
            </Button>
          </Link>

        </div>


        {/* ✅ MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen
            ? <X className="h-6 w-6" />
            : <Menu className="h-6 w-6" />}
        </button>

      </div>


      {/* ✅ MOBILE MENU */}
      {mobileOpen && (
        <div className="border-t bg-card p-4 md:hidden">

          <div className="flex flex-col gap-3">

            <Link
              href="/opportunities"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-muted-foreground"
            >
              Opportunities
            </Link>

            <Link
              href="/badges"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-muted-foreground"
            >
              Badges
            </Link>

            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full cursor-pointer transition-colors">
                Log In
              </Button>
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
