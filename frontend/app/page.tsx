// app/page.tsx
import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import TrustedPartners from "./components/TrustedPartners";
import FeaturesSection from "./components/FeaturesSection";
export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <TrustedPartners />
      <Footer />
      
    </>
    
  );
}