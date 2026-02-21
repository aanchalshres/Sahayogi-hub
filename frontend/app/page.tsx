import React from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "./components/Navbar";
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
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-200 rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10 px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-green-200 shadow-sm mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-green-700">Making a Difference Together</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Connect. Volunteer.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
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
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-500">
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

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and begin making an impact right away
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
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
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
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
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
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
          <div className="mt-16 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium">Verified NGOs with transparent impact</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium">Real-time opportunity matching</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium">Digital badges & certificates</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium">Track your volunteer hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* Current Impact Counter Section */}
      <section className="py-24 bg-gradient-to-r from-[#5B5BD6] to-[#7C3AED] relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="container px-4 relative z-10">
          <div className="text-center mb-16">
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
      <section className="py-24 bg-gray-50">
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
              <div className="bg-gradient-to-br from-green-100 to-blue-100 p-10 md:p-12 flex items-center justify-center">
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo3.png"
                  alt="Sahayogi Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold">Sahayogi</span>
              </div>
              <p className="text-gray-400 mb-4">
                Connecting volunteers with NGOs to create meaningful change in Nepal.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/opportunities" className="text-gray-400 hover:text-white transition-colors">Opportunities</Link></li>
                <li><Link href="/badges" className="text-gray-400 hover:text-white transition-colors">Badges</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Guidelines</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Kathmandu, Nepal</li>
                <li>info@sahayogi.org</li>
                <li>+977-1-4XXXXXX</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 Sahayogi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
