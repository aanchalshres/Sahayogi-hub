import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#F0F1F3]">
      <div className="container relative z-10 px-4 py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-[#111827] mb-6">
          Connect. Volunteer.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F46C8] to-[#7683D6]">
            Impact.
          </span>
        </h1>
        <p className="text-xl text-[#6B7280] mb-10">
          Join Nepal's largest volunteer network. Connect with NGOs, track your contributions, and make a real difference.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/login?mode=signup">
            <Button className="bg-[#4F46C8] hover:bg-[#3c3a9f] text-white px-8 py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
              Start Volunteering
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/about">
            <Button className="bg-[#7683D6] hover:bg-[#5e63b0] text-white px-8 py-4 rounded-xl shadow-lg">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}