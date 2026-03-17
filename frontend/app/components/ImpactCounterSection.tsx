import { Users, Clock, Heart, TrendingUp } from "lucide-react";

export default function ImpactCounterSection() {
  const counters = [
    { icon: <Users className="w-10 h-10 text-white" />, value: "12,500+", label: "Active Volunteers" },
    { icon: <Clock className="w-10 h-10 text-white" />, value: "45,000+", label: "Hours Contributed" },
    { icon: <Heart className="w-10 h-10 text-white" />, value: "850+", label: "NGOs Partnered" },
    { icon: <TrendingUp className="w-10 h-10 text-white" />, value: "2,100+", label: "Events Completed" }
  ];

  return (
    <section className="py-24 bg-[#4F46C8] text-white">
      <div className="container mx-auto px-4 text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Collective Impact</h2>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Together, we're building a stronger Nepal through the power of community service
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
        {counters.map((c, idx) => (
          <div key={idx} className="text-center">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              {c.icon}
            </div>
            <div className="text-4xl md:text-5xl font-bold mb-2">{c.value}</div>
            <div className="text-white/80 font-medium">{c.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}