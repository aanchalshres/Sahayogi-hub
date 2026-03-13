import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Users, Globe, Heart, CheckCircle2, ArrowRight } from "lucide-react";

export default function OpportunitiesPage() {
  return (
    <>
      <Navbar />

      <section className="relative py-12 md:py-24 bg-linear-to-br from-green-50 via-white to-blue-50 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-56 h-56 bg-green-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl"></div>
        </div>
        <div className="container relative z-10 px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find the Right
            <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-blue-600"> Volunteer Opportunity</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover verified opportunities, match by your skills, and start contributing in your community.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and begin making an impact right away
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto justify-items-center">
            <div className="relative group w-full max-w-sm">
              <div className="absolute -inset-4 bg-linear-to-r from-green-100 to-blue-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-full bg-white rounded-2xl p-8 border border-gray-100 shadow-lg text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <div className="absolute top-8 right-8 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Create Your Profile</h3>
                <p className="text-gray-600">
                  Sign up and set up your volunteer profile. Choose your skills, interests, and availability to get matched.
                </p>
              </div>
            </div>

            <div className="relative group w-full max-w-sm">
              <div className="absolute -inset-4 bg-linear-to-r from-blue-100 to-purple-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-full bg-white rounded-2xl p-8 border border-gray-100 shadow-lg text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
                <div className="absolute top-8 right-8 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Discover Opportunities</h3>
                <p className="text-gray-600">
                  Browse verified opportunities from trusted NGOs. Filter by cause, time commitment, and required skills.
                </p>
              </div>
            </div>

            <div className="relative group w-full max-w-sm">
              <div className="absolute -inset-4 bg-linear-to-r from-purple-100 to-pink-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-full bg-white rounded-2xl p-8 border border-gray-100 shadow-lg text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <div className="absolute top-8 right-8 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Make an Impact</h3>
                <p className="text-gray-600">
                  Join events, contribute hours, and get recognized for your community service.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
              <span className="text-gray-700 font-medium">Verified NGOs with transparent impact</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
              <span className="text-gray-700 font-medium">Real-time opportunity matching</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-purple-600 shrink-0" />
              <span className="text-gray-700 font-medium">Digital badges and certificates</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-yellow-600 shrink-0" />
              <span className="text-gray-700 font-medium">Track your volunteer hours</span>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link href="/login?mode=signup">
              <Button size="lg" className="bg-[#5B5BD6] hover:bg-[#4a4ac4] text-white px-8 py-6 text-lg rounded-xl">
                Start Volunteering
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