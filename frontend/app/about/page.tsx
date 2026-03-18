import React from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import { Button } from "../components/ui/button";
import { 
  Heart, 
  Users, 
  Award, 
  Globe, 
  Shield, 
  Target, 
  Eye,
  Compass,
  ArrowRight,
  CheckCircle2,
  Star,
  Zap
} from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-12 md:py-24 bg-linear-to-br from-green-50 via-white to-blue-50">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-blue-600">Sahayogi</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Connecting passionate volunteers with trusted NGOs to create meaningful, 
              lasting change in communities across Nepal.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-3xl p-8">
              <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To bridge the gap between willing volunteers and organizations that need their help, 
                creating a seamless platform that empowers individuals to contribute meaningfully to 
                their communities while ensuring NGOs can efficiently recruit and manage volunteer resources.
              </p>
            </div>
            
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-3xl p-8">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                To become Nepal's most trusted volunteer management platform, fostering a culture 
                of community service where every individual has the opportunity to make a 
                positive impact and every NGO can easily mobilize support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-6 text-center shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Compassion</h3>
              <p className="text-sm text-gray-600">We believe in the power of empathy and genuine care for others</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-center shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Trust</h3>
              <p className="text-sm text-gray-600">Building transparent and reliable connections between volunteers and NGOs</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-center shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Impact</h3>
              <p className="text-sm text-gray-600">Focusing on measurable outcomes that create real change</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-center shadow-md">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-sm text-gray-600">Fostering collaboration and unity across all stakeholders</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 bg-[#5B5BD6]">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">12,500+</div>
              <div className="text-white/80">Active Volunteers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">850+</div>
              <div className="text-white/80">NGOs Partnered</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">45,000+</div>
              <div className="text-white/80">Hours Contributed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">2,100+</div>
              <div className="text-white/80">Events Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Sahayogi?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing volunteer management in Nepal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="w-14 h-14 bg-[#5B5BD6]/10 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-[#5B5BD6]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified NGOs</h3>
              <p className="text-gray-600">
                All organizations on our platform are vetted and verified to ensure 
                legitimacy and trustworthy volunteer opportunities.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Nationwide Reach</h3>
              <p className="text-gray-600">
                Connect with opportunities across all 77 districts of Nepal, 
                from remote villages to major cities.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Recognition System</h3>
              <p className="text-gray-600">
                Earn digital badges and certificates for your contributions, 
                building your volunteer portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-20 bg-linear-to-br from-green-50 to-blue-50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-gray-600">Hear from volunteers and NGOs who've joined our community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Sahayogi made it so easy to find meaningful volunteer opportunities. 
                I've been able to contribute over 100 hours to education initiatives in my district."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">RS</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Ram Shrestha</div>
                  <div className="text-sm text-gray-500">Volunteer, Kathmandu</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "As an NGO, finding dedicated volunteers used to be a challenge. 
                Sahayogi connected us with passionate individuals who truly care about our mission."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">SP</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Sarita Poudel</div>
                  <div className="text-sm text-gray-500">Director, Nepal Cares</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The badge system keeps me motivated! It's amazing to see my volunteer 
                journey documented and recognized. Highly recommend to anyone wanting to help."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">BT</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Bikram Tamang</div>
                  <div className="text-sm text-gray-500">Volunteer, Pokhara</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join Our Community?</h2>
            <p className="text-gray-600 mb-8">
              Whether you're looking to volunteer or need help organizing your NGO's volunteer program, 
              we'd love to have you on board.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login?mode=signup">
                <Button className="bg-[#5B5BD6] hover:bg-[#4a4ac4] text-white px-8 py-3 rounded-xl font-medium">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="px-8 py-3 rounded-xl font-medium border-gray-300">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}