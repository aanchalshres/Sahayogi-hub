 'use client';

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  Loader2,
  MessageSquare,
  Headphones,
  Zap
} from "lucide-react";
import { Toaster, toast } from "@/app/components/ui/sonner";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'general' | 'volunteer' | 'ngo' | 'partnership';
}

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      type: 'general'
    });
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <Navbar />
      <Toaster position="top-right" />
      
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-linear-to-br from-green-50 via-white to-blue-50">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Get in <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-blue-600">Touch</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Have questions about volunteering or need support? We'd love to hear from you.
              Our team is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 text-sm">info@sahayogi.org</p>
              <p className="text-gray-500 text-sm">support@sahayogi.org</p>
            </div>
            
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600 text-sm">+977-1-4XXXXXX</p>
              <p className="text-gray-500 text-sm">Mon-Fri, 9AM-6PM</p>
            </div>
            
            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600 text-sm">Kathmandu, Nepal</p>
              <p className="text-gray-500 text-sm">All 77 Districts</p>
            </div>
            
            <div className="bg-linear-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Response Time</h3>
              <p className="text-gray-600 text-sm">Within 24 hours</p>
              <p className="text-gray-500 text-sm">24/7 Emergency</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5BD6] focus:border-transparent transition"
                    placeholder="Roshan Shrestha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5BD6] focus:border-transparent transition"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5BD6] focus:border-transparent transition"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="ngo">NGO Representative</option>
                    <option value="partnership">Partnership / Collaboration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5BD6] focus:border-transparent transition"
                    placeholder="How can I help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5BD6] focus:border-transparent transition resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#5B5BD6] hover:bg-[#4a4ac4] text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Quick Support */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Need Quick Help?</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">General Inquiries</h4>
                      <p className="text-sm text-gray-600">Questions about volunteering, NGOs, or the platform</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Technical Support</h4>
                      <p className="text-sm text-gray-600">Issues with login, dashboard, or account access</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                      <Headphones className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Emergency Support</h4>
                      <p className="text-sm text-gray-600">Urgent requests during disasters or emergencies</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Teaser */}
              <div className="bg-linear-to-br from-[#5B5BD6] to-[#7C3AED] rounded-2xl shadow-lg p-8 text-white">
                <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
                <p className="text-white/80 mb-6">
                  Find quick answers to common questions about volunteering and our platform.
                </p>
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="font-medium text-sm">How do I become a volunteer?</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="font-medium text-sm">How can my NGO register?</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="font-medium text-sm">Are volunteer opportunities paid?</p>
                  </div>
                </div>
                <Link href="/login?mode=signup">
                  <Button className="w-full mt-6 bg-white text-[#5B5BD6] hover:bg-gray-100">
                    Join Now
                  </Button>
                </Link>
              </div>

              {/* Office Location */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Headquarters</h3>
                <div className="space-y-3 text-gray-600">
                  <p className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#5B5BD6] shrink-0" />
                    <span>Thamel, Kathmandu 44600<br />Nepal</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#5B5BD6] shrink-0" />
                    <span>info@sahayogi.org</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#5B5BD6] shrink-0" />
                    <span>+977-1-4XXXXXX</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gray-100 rounded-2xl h-80 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Interactive map coming soon</p>
                <p className="text-gray-400 text-sm">Kathmandu, Nepal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
