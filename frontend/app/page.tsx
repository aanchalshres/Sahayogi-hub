// app/page.tsx
import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import HeroSection from "./components/HeroSection";
import CTASection from "./components/CTASection";
import HowItWorksSection from "./components/HowItWorksSection";
import ImpactCounterSection from "./components/ImpactCounterSection";
export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <CTASection />
      <HowItWorksSection />
      <ImpactCounterSection />
      <Footer />
      
    </>
    
  );
}
