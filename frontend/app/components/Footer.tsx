"use client";

import Link from "next/link";
import Image from "next/image";
import { Handshake, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-[#CACDD3] bg-[#F0F1F3]">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Image
                src="/logo1.png"
                alt="Sahayogi Logo"
                width={36}
                height={36}
                className="rounded-lg"
              />

              <span className="text-lg font-bold text-[#111827]">Sahayogi</span>
            </div>

            <p className="text-sm leading-relaxed text-[#6B7280]">
              Connecting volunteers and organizations across Nepal for emergency response,
              disaster relief, and meaningful community impact.
            </p>

            <div className="mt-4 flex gap-3">
              <Link href="https://facebook.com/yourusername" target="_blank" rel="noreferrer">
                <Facebook className="h-5 w-5 cursor-pointer text-[#6B7280] transition-colors hover:text-[#4F46C8]" />
              </Link>

              <Link href="https://twitter.com/yourusername" target="_blank" rel="noreferrer">
                <Twitter className="h-5 w-5 cursor-pointer text-[#6B7280] transition-colors hover:text-[#4F46C8]" />
              </Link>

              <Link href="https://instagram.com/yourusername" target="_blank" rel="noreferrer">
                <Instagram className="h-5 w-5 cursor-pointer text-[#6B7280] transition-colors hover:text-[#4F46C8]" />
              </Link>

              <Link href="https://linkedin.com/in/yourusername" target="_blank" rel="noreferrer">
                <Linkedin className="h-5 w-5 cursor-pointer text-[#6B7280] transition-colors hover:text-[#4F46C8]" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#111827]">Platform</h4>

            <div className="flex flex-col gap-2">
              <Link
                href="/opportunities"
                className="text-sm text-[#6B7280] transition-colors hover:text-[#4F46C8]"
              >
                Opportunities
              </Link>

              <Link
                href="/badges"
                className="text-sm text-[#6B7280] transition-colors hover:text-[#4F46C8]"
              >
                Badges
              </Link>

              <Link
                href="/login?mode=signup"
                className="text-sm text-[#6B7280] transition-colors hover:text-[#4F46C8]"
              >
                Join Us
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#111827]">Resources</h4>

            <div className="flex flex-col gap-2">
              <Link href="#" className="text-sm text-[#6B7280] transition-colors hover:text-[#4F46C8]">
                Help Center
              </Link>

              <Link href="#" className="text-sm text-[#6B7280] transition-colors hover:text-[#4F46C8]">
                Guidelines
              </Link>

              <Link href="#" className="text-sm text-[#6B7280] transition-colors hover:text-[#4F46C8]">
                Safety
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#111827]">Legal</h4>

            <div className="flex flex-col gap-2">
              <Link href="#" className="text-sm text-[#6B7280] transition-colors hover:text-[#4F46C8]">
                Privacy Policy
              </Link>

              <Link href="#" className="text-sm text-[#6B7280] transition-colors hover:text-[#4F46C8]">
                Terms of Service
              </Link>

              <Link href="#" className="text-sm text-[#6B7280] transition-colors hover:text-[#4F46C8]">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#B9C0D4] pt-6 md:flex-row">
          <p className="text-center text-sm text-[#6B7280] md:text-left">
            © 2026 Sahayogi. All rights reserved.
          </p>

          <p className="flex items-center gap-1 text-sm text-[#6B7280]">
            Made by
            <Handshake className="h-4 w-4 text-[#4F46C8]" />
            Team Sahayogi
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;