import React from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Button } from "./components/ui/button";
import { 
  Heart, 
  Users, 
  Clock, 
  Award, 
  Shield, 
  Zap, 
  ArrowRight, 
  CheckCircle2,
  Globe,
  TrendingUp
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-linear-to-br from-green-50 via-white to-blue-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-5 md:top-20 left-5 md:left-10 w-40 md:w-72 h-40 md:h-72 bg-green-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-5 md:bottom-20 right-5 md:right-10 w-48 md:w-96 h-48 md:h-96 bg-purple-200 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-40 md:w-64 h-40 md:h-64 bg-blue-200 rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10 px-4 py-10 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-green-200 shadow-sm mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-green-700">Making a Difference Together</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Connect. Volunteer.{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-blue-600">
                Impact.
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join's largest Nepal volunteer network. Connect with NGOs, track your contributions, 
              and make a real difference in your community.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login?mode=signup">
                <Button size="lg" className="bg-[#5B5BD6] hover:bg-[#4a4ac4] text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Start Volunteering
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 md:mt-16 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Verified NGOs</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Instant Matching</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Earn Badges</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-24 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and begin making an impact right away
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto justify-items-center">
            {/* Step 1 */}
            <div className="relative group w-full max-w-sm">
              <div className="absolute -inset-4 bg-linear-to-r from-green-100 to-blue-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-full bg-white rounded-2xl p-8 border border-gray-100 shadow-lg text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <div className="absolute top-8 right-8 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Create Your Profile</h3>
                <p className="text-gray-600">
                  Sign up and set up your volunteer profile. Choose your skills, interests, and availability to get matched with the right opportunities.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group w-full max-w-sm">
              <div className="absolute -inset-4 bg-linear-to-r from-blue-100 to-purple-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-full bg-white rounded-2xl p-8 border border-gray-100 shadow-lg text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
                <div className="absolute top-8 right-8 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Discover Opportunities</h3>
                <p className="text-gray-600">
                  Browse verified volunteer opportunities from trusted NGOs in your area. Filter by cause, time commitment, and skills required.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group w-full max-w-sm">
              <div className="absolute -inset-4 bg-linear-to-r from-purple-100 to-pink-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-full bg-white rounded-2xl p-8 border border-gray-100 shadow-lg text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <div className="absolute top-8 right-8 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Make an Impact</h3>
                <p className="text-gray-600">
                  Sign up for events, complete volunteer hours, and track your contributions. Earn badges and recognition for your community service.
                </p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="mt-12 md:mt-16 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
              <span className="text-gray-700 font-medium">Digital badges & certificates</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-yellow-600 shrink-0" />
              <span className="text-gray-700 font-medium">Track your volunteer hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* Current Impact Counter Section */}
      <section className="py-16 md:py-24 bg-linear-to-r from-[#5B5BD6] to-[#7C3AED] relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="container px-4 relative z-10">
          <div className="text-center my-8 md:my-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Collective Impact
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Together, we're building a stronger Nepal through the power of community service
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {/* Counter 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                12,500+
              </div>
              <div className="text-white/80 font-medium">
                Active Volunteers
              </div>
            </div>

            {/* Counter 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                45,000+
              </div>
              <div className="text-white/80 font-medium">
                Hours Contributed
              </div>
            </div>

            {/* Counter 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                850+
              </div>
              <div className="text-white/80 font-medium">
                NGOs Partnered
              </div>
            </div>

            {/* Counter 4 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                2,100+
              </div>
              <div className="text-white/80 font-medium">
                Events Completed
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link href="/login?mode=signup">
              <Button size="lg" className="bg-white text-[#5B5BD6] hover:bg-gray-100 px-10 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                Join Our Community
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-10 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Ready to Make a Difference?
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Whether you're an individual looking to volunteer or an NGO seeking dedicated helpers, 
                  Sahayogi connects you with meaningful opportunities.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/login?mode=signup">
                    <Button className="bg-[#5B5BD6] hover:bg-[#4a4ac4] text-white px-6 py-3 rounded-lg font-medium">
                      Sign Up Now
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" className="px-6 py-3 rounded-lg font-medium border-gray-300">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-linear-to-br from-green-100 to-blue-100 p-10 md:p-12 flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-4 shadow-md">
                      <div className="text-3xl font-bold text-[#5B5BD6] mb-1">24/7</div>
                      <div className="text-sm text-gray-600">Support</div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-md">
                      <div className="text-3xl font-bold text-green-600 mb-1">100%</div>
                      <div className="text-sm text-gray-600">Free</div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-md">
                      <div className="text-3xl font-bold text-blue-600 mb-1">50+</div>
                      <div className="text-sm text-gray-600">Districts</div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-md">
                      <div className="text-3xl font-bold text-purple-600 mb-1">15+</div>
                      <div className="text-sm text-gray-600">Causes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
