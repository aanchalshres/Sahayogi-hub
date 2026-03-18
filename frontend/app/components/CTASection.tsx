import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 bg-[#F0F1F3]">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-[#111827] mb-4">Ready to Make a Difference?</h2>
        <p className="text-[#6B7280] mb-8 text-lg">
          Whether you're an individual looking to volunteer or an NGO seeking helpers, Sahayogi connects you with meaningful opportunities.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/login?mode=signup">
            <Button className="bg-[#4F46C8] hover:bg-[#3c3a9f] text-white px-6 py-3 rounded-lg font-medium">
              Sign Up Now
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="px-6 py-3 rounded-lg font-medium border-[#CACDD3] text-[#111827] hover:bg-[#B9C0D4]/50">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}