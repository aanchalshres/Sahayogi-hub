import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import { Button } from "../components/ui/button";
import { Award, ArrowRight, Star, Users, Clock, TrendingUp } from "lucide-react";

const badges = [
  {
    title: "Community Starter",
    hours: "10+ hours",
    color: "from-green-500 to-emerald-600",
    description: "Complete your first volunteer milestone and start your impact journey.",
  },
  {
    title: "Consistent Contributor",
    hours: "50+ hours",
    color: "from-blue-500 to-indigo-600",
    description: "Show reliable commitment by volunteering regularly across multiple events.",
  },
  {
    title: "Impact Champion",
    hours: "100+ hours",
    color: "from-purple-500 to-pink-600",
    description: "Earn top recognition for sustained and meaningful community service.",
  },
];

export default function BadgesPage() {
  return (
    <>
      <Navbar />

      <section className="relative py-12 md:py-24 bg-linear-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-12 left-12 w-56 h-56 bg-blue-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-12 right-12 w-72 h-72 bg-purple-200 rounded-full blur-3xl"></div>
        </div>
        <div className="container relative z-10 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 shadow-sm mb-8">
            <Award className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Recognition That Matters</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Badges and
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600"> Certificates</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your volunteer hours are tracked and celebrated with digital badges that reflect your real contribution.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Badge Milestones</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Progress through meaningful levels as your impact grows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {badges.map((badge) => (
              <div key={badge.title} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${badge.color} flex items-center justify-center mb-6`}>
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{badge.title}</h3>
                <p className="text-sm font-semibold text-[#5B5BD6] mb-3">{badge.hours}</p>
                <p className="text-gray-600">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-linear-to-r from-[#5B5BD6] to-[#7C3AED]">
        <div className="container px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <Users className="w-8 h-8 text-white mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">12,500+</p>
              <p className="text-white/80">Volunteers</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <Clock className="w-8 h-8 text-white mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">45,000+</p>
              <p className="text-white/80">Hours Logged</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <TrendingUp className="w-8 h-8 text-white mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">2,100+</p>
              <p className="text-white/80">Events Completed</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/login?mode=signup">
              <Button size="lg" className="bg-white text-[#5B5BD6] hover:bg-gray-100 px-8 py-6 rounded-xl">
                Earn Your First Badge
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}