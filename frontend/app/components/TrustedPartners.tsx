"use client";

import { Star } from "lucide-react";

type Testimonial = {
  name: string;
  role: string;
  message: string;
  initials: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Sita Sharma",
    role: "Volunteer, Kathmandu",
    message:
      "Sahayogi helped me find meaningful volunteer work near my community. The badge system keeps me motivated!",
    initials: "SS",
  },
  {
    name: "Nepal Red Cross",
    role: "Partner Organization",
    message:
      "We've been able to mobilize volunteers 3x faster during emergencies since partnering with Sahayogi.",
    initials: "RC",
  },
  {
    name: "Ramesh Thapa",
    role: "Volunteer, Pokhara",
    message:
      "The skill-matching algorithm connected me with the perfect disaster relief project. Truly life-changing.",
    initials: "RT",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-[#F0F1F3] py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        
        {/* Top Label */}
        <p className="text-sm font-semibold text-[#4F46C8] uppercase tracking-wide mb-2">
          Testimonials
        </p>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-12">
          Trusted by Volunteers & Organizations
        </h2>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-[#CACDD3] rounded-xl p-6 text-left shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-[#4F46C8] fill-[#4F46C8]"
                  />
                ))}
              </div>

              {/* Message */}
              <p className="text-[#6B7280] text-sm italic leading-relaxed mb-6">
                "{item.message}"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#4F46C8]/10 text-[#4F46C8] font-semibold">
                  {item.initials}
                </div>

                {/* Name + Role */}
                <div>
                  <p className="text-sm font-semibold text-[#111827]">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#6B7280]">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}