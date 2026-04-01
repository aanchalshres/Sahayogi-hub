import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, Heart } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#F0F1F3]">
      <div className="container relative z-10 px-4 py-20 text-center max-w-4xl mx-auto">
        {/* Top small pill text */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#CACDD3] bg-white px-4 py-1.5 text-sm text-[#6B7280] mb-6 shadow-sm mx-auto">
          <Heart className="w-4 h-4 text-[#F87171]" />
          Nepal's Emergency & Volunteer Platform
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-bold text-[#111827] mb-6">
          Connect. Help.{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#4F46C8] to-[#7683D6]">
            Make an Impact.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-xl text-[#6B7280] mb-10">
          Sahayogi connects volunteers, NGOs, and communities across Nepal for coordinated emergency response and meaningful social initiatives.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/signup">
            <Button className="bg-[#4F46C8] hover:bg-[#3c3a9f] text-white px-8 py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-1">
              Join as Volunteer
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="border border-[#4F46C8] text-[#4F46C8] hover:bg-[#F0F1F3] px-8 py-4 rounded-xl shadow-sm transition-all duration-300">
              Register Organization
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}