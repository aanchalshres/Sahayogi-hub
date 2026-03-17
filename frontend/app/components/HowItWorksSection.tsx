import { Users, Globe, Heart } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      id: 1,
      title: "Create Your Profile",
      description: "Sign up and set up your volunteer profile with skills and availability.",
      icon: <Users className="w-8 h-8 text-[#4F46C8]" />,
      bg: "bg-[#B9C0D4]/30"
    },
    {
      id: 2,
      title: "Discover Opportunities",
      description: "Browse verified volunteer opportunities from trusted NGOs.",
      icon: <Globe className="w-8 h-8 text-[#7683D6]" />,
      bg: "bg-[#B9C0D4]/30"
    },
    {
      id: 3,
      title: "Make an Impact",
      description: "Sign up for events, track hours, and earn badges for contributions.",
      icon: <Heart className="w-8 h-8 text-[#4F46C8]" />,
      bg: "bg-[#B9C0D4]/30"
    }
  ];

  return (
    <section className="py-24 bg-[#F0F1F3]">
      <div className="container mx-auto px-4 text-center mb-16">
        <h2 className="text-4xl font-bold text-[#111827] mb-4">How It Works</h2>
        <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
          Get started in minutes and begin making an impact right away
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {steps.map((step) => (
          <div key={step.id} className="relative bg-white rounded-2xl p-8 shadow-lg border border-[#CACDD3]">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${step.bg}`}>
              {step.icon}
            </div>
            <h3 className="text-xl font-bold text-[#111827] mb-2">{step.title}</h3>
            <p className="text-[#6B7280]">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}