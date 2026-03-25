"use client";

import { Target, AlertTriangle, Shield, Award } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Skill-Based Matching",
    description:
      "Our algorithm matches you to opportunities that align with your skills, location, and availability — so every hour counts.",
    bg: "bg-[#4F46C8]/10",
    iconColor: "text-[#4F46C8]",
  },
  {
    icon: AlertTriangle,
    title: "Emergency Alerts",
    description:
      "Receive real-time emergency notifications. When disaster strikes, respond instantly with coordinated support.",
    bg: "bg-red-100",
    iconColor: "text-red-500",
  },
  {
    icon: Shield,
    title: "Verified Organizations",
    description:
      "Every NGO on our platform goes through a rigorous verification process. Volunteer with confidence.",
    bg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    icon: Award,
    title: "Digital Badges & Portfolio",
    description:
      "Earn verifiable digital badges. Build a volunteer portfolio that showcases your real-world impact.",
    bg: "bg-[#7683D6]/10",
    iconColor: "text-[#7683D6]",
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-[#F0F1F3] py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        
        {/* Small Heading */}
        <p className="text-sm font-semibold text-[#4F46C8] tracking-wide uppercase mb-2">
          Why Sahayogi?
        </p>

        {/* Main Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-[#111827] leading-tight">
          Everything You Need to Volunteer <br /> Effectively
        </h2>

        {/* Subtitle */}
        <p className="mt-4 text-[#6B7280] max-w-2xl mx-auto">
          Powerful tools for volunteers and organizations to coordinate,
          respond, and create lasting impact.
        </p>

        {/* Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="bg-white border border-[#CACDD3] rounded-xl p-6 text-left shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-xl mb-4 ${feature.bg}`}
                >
                  <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-[#111827]">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}